/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example' | 'get-data'; // Example of additional channels

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args); // Send message using ipcRenderer
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args); // Wrap the callback with event arguments

      ipcRenderer.on(channel, subscription); // Attach listener to the specified channel

      return () => {
        ipcRenderer.removeListener(channel, subscription); // Remove the listener
      };
    },

    // Listen for a message once on a specific channel (it will automatically remove itself after the first call)
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args) =>
        func(...args),
      ); // Handle once and then remove listener automatically
    },

    invoke(channel: Channels, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args); // Return the promise from the main process
    },
  },
};

// Expose the electron handler to the renderer process
contextBridge.exposeInMainWorld('electron', electronHandler);

// Define the ElectronHandler type to expose in the main world for better type safety
export type ElectronHandler = typeof electronHandler;
