// discord-activity.ts

import { Client } from 'discord-rpc';

export default class DiscordActivity {
  private clientId: string;
  private rpc: any;
  private isConnected: boolean = false;
  private startTime: number = Date.now();

  constructor(clientId: string) {
    this.clientId = clientId;
    this.rpc = new Client({ transport: 'ipc' });
    this.setupEvents();
  }

  private setupEvents() {
    this.rpc.on('ready', () => {
      this.isConnected = true;
      console.log('🔗 Discord RPC connected!'); // Added for clarity
    });

    this.rpc.on('disconnected', () => {
      this.isConnected = false;
      console.log('🔌 Discord RPC disconnected.'); // Added for clarity
    });
  }

  async connect(): Promise<boolean> {
    try {
      await this.rpc.login({ clientId: this.clientId });
      return true;
    } catch (error: any) {
      console.error('Failed to connect to Discord:', error.message);
      return false;
    }
  }

  async setBrowseActivity(): Promise<void> {
    if (!this.isConnected) return;

    this.startTime = Date.now();
    const activity = {
      details: 'Browsing the library',
      startTimestamp: this.startTime,
      largeImageKey: 'reimi_icon',
      largeImageText: 'Reimi',
      smallImageKey: 'browse_icon',
      smallImageText: 'Browse',
    };

    try {
      await this.rpc.setActivity(activity);
    } catch (error) {
      console.error('Failed to set Browse activity:', error);
    }
  }

  async setReadingActivity(mangaData: {
    title: string;
    chapter: string;
    posterURL?: string;
  }): Promise<void> {
    if (!this.isConnected) return;

    this.startTime = Date.now();
    const activity = {
      details: `${mangaData.title}`,
      state: `${mangaData.chapter}`,
      startTimestamp: this.startTime,
      largeImageKey: mangaData.posterURL || 'manga_icon',
      largeImageText: mangaData.title,
      smallImageKey: 'app_logo',
      smallImageText: 'Reading',
    };

    try {
      await this.rpc.setActivity(activity);
    } catch (error) {
      console.error('Failed to set reading activity:', error);
    }
  }

  async setWatchingActivity(videoData: {
    animeTitle: string;
    episodeTitle: string;
    posterURL?: string;
  }): Promise<void> {
    if (!this.isConnected) return;
    const { animeTitle, episodeTitle, posterURL } = videoData;

    const activity = {
      details: `${animeTitle}`,
      state: `${episodeTitle}`,
      largeImageKey: posterURL || 'anime_icon',
      largeImageText: animeTitle,
      smallImageKey: 'app_logo',
      smallImageText: 'Watching',
    };

    try {
      await this.rpc.setActivity(activity);
    } catch (error) {
      console.error('Failed to set watching activity:', error);
    }
  }

  async setCheckingDetailsActivity(data: {
    title: string;
    posterURL?: string;
  }): Promise<void> {
    if (!this.isConnected) return;

    this.startTime = Date.now();
    const activity = {
      details: `${data.title}`,
      startTimestamp: this.startTime,
      largeImageKey: data.posterURL || 'entry_icon',
      largeImageText: data.title,
      smallImageKey: 'app_logo',
      smallImageText: 'Viewing Details',
    };

    try {
      await this.rpc.setActivity(activity);
    } catch (error) {
      console.error('Failed to set checking details activity:', error);
    }
  }

  async clearActivity(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.rpc.clearActivity();
    } catch (error) {
      console.error('Failed to clear activity:', error);
    }
  }

  disconnect(): void {
    if (this.isConnected) {
      this.rpc.destroy();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
