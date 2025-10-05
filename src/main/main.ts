/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const fs = require('fs');
const https = require('https');
const http = require('http');

ipcMain.handle(
  'download-chapter',
  async (_, { mangaTitle, chapterTitle, pages }) => {
    try {
      const sanitizeName = (name) =>
        name
          .replace(/[<>:"/\\|?*]/g, '_')
          .replace(/\s+/g, ' ')
          .trim();
      const downloadFolder = path.join(
        app.getPath('downloads'),
        'Reimi downloads',
        sanitizeName(mangaTitle),
        sanitizeName(chapterTitle),
      );
      await fs.promises.mkdir(downloadFolder, { recursive: true });
      const downloadImage = async (url, filepath) => {
        return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https') ? https : http;
          const timeout = setTimeout(() => {
            reject(new Error('Download timeout'));
          }, 30000);

          protocol
            .get(url, (res) => {
              if (
                res.statusCode >= 300 &&
                res.statusCode < 400 &&
                res.headers.location
              ) {
                clearTimeout(timeout);
                return downloadImage(res.headers.location, filepath)
                  .then(resolve)
                  .catch(reject);
              }
              if (res.statusCode !== 200) {
                clearTimeout(timeout);
                return reject(new Error(`HTTP ${res.statusCode}`));
              }
              const fileStream = fs.createWriteStream(filepath);
              res.pipe(fileStream);
              fileStream.on('finish', () => {
                clearTimeout(timeout);
                fileStream.close(resolve);
              });
              fileStream.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
              });
            })
            .on('error', (err) => {
              clearTimeout(timeout);
              reject(err);
            });
        });
      };
      let successCount = 0;
      let failedCount = 0;
      const failedPages = [];
      const concurrentLimit = 3;
      for (let i = 0; i < pages.length; i += concurrentLimit) {
        const batch = pages.slice(i, i + concurrentLimit);
        const promises = batch.map(async (pageUrl, batchIndex) => {
          const pageIndex = i + batchIndex;
          try {
            let ext = path.extname(new URL(pageUrl).pathname);
            if (!ext || ext.length > 5) {
              ext = '.jpg';
            }
            const filename = `${String(pageIndex + 1).padStart(3, '0')}${ext}`;
            const filepath = path.join(downloadFolder, filename);
            if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
              successCount++;
              return;
            }
            await downloadImage(pageUrl, filepath);
            successCount++;
          } catch (error) {
            failedCount++;
            failedPages.push({
              index: pageIndex + 1,
              url: pageUrl,
              error: error.message,
            });
            console.error(`Failed to download page ${pageIndex + 1}:`, error);
          }
        });
        await Promise.allSettled(promises);
        if (i + concurrentLimit < pages.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      const result = {
        success: true,
        totalPages: pages.length,
        successCount,
        failedCount,
        downloadPath: downloadFolder,
        failedPages: failedPages.length > 0 ? failedPages : undefined,
      };
      console.log(
        `Download completed for "${chapterTitle}": ${successCount}/${pages.length} pages successful`,
      );
      if (failedCount > 0) {
        console.warn(`${failedCount} pages failed to download`);
      }
      return result;
    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        error: error.message,
        totalPages: pages?.length || 0,
        successCount: 0,
        failedCount: pages?.length || 0,
      };
    }
  },
);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    backgroundColor: '#141517',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      {
        urls: ['*://*.mp4upload.com/*'],
      },
      (details, callback) => {
        const url = new URL(details.url);

        // Handle mp4upload.com
        if (url.hostname.includes('mp4upload.com')) {
          details.requestHeaders['Referer'] = 'https://www.mp4upload.com/';
        }

        callback({ cancel: false, requestHeaders: details.requestHeaders });
      },
    );

    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
