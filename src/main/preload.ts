/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define the IPC channels as a type (you can expand this as needed)
export type Channels = 'ipc-example' | 'set-full-screen' | 'get-data'; // Example of additional channels

// Define the ElectronHandler type for better type safety
const electronHandler = {
  ipcRenderer: {
    // Send a message to the main process on a given channel
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args); // Send message using ipcRenderer
    },

    // Listen for messages on a specific channel
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args); // Wrap the callback with event arguments

      ipcRenderer.on(channel, subscription); // Attach listener to the specified channel

      // Return a function to remove the listener when no longer needed
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

    // Send a request to the main process and wait for a response
    invoke(channel: Channels, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args); // Return the promise from the main process
    },
  },
};

// Expose the electron handler to the renderer process
contextBridge.exposeInMainWorld('electron', electronHandler);

// Define the ElectronHandler type to expose in the main world for better type safety
export type ElectronHandler = typeof electronHandler;
