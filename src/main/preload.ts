/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'get-data'
  | 'discord-set-browse'
  | 'discord-set-reading'
  | 'discord-update-page'
  | 'discord-set-details-checking'
  | 'discord-clear';

contextBridge.exposeInMainWorld('electronAPI', {
  downloadChapter: (data) => ipcRenderer.invoke('download-chapter', data),
});

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);

      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args) =>
        func(...args),
      );
    },

    invoke(channel: Channels, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args);
    },
  },

  discord: {
    setBrowse: () => ipcRenderer.invoke('discord-set-browse'),
    setReading: (mangaData: {
      title: string;
      chapter: string;
      page?: number;
    }) => ipcRenderer.invoke('discord-set-reading', mangaData),
    updatePage: (updates: { page?: number }) =>
      ipcRenderer.invoke('discord-update-page', updates),
    setDetailsChecking: (mangaData: { title: string; posterURL?: string }) =>
      ipcRenderer.invoke('discord-set-details-checking', mangaData),
    clear: () => ipcRenderer.invoke('discord-clear'),
    getStatus: () => ipcRenderer.invoke('discord-status'),
  },
  downloadChapter: (data: {
    mangaTitle: string;
    chapterTitle: string;
    pages: string[];
  }) => ipcRenderer.invoke('download-chapter', data),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
