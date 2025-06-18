import { SyncService } from '../services/sync.service.js';

export class FeedSyncJob {
  constructor(private syncService: SyncService) {}

  async run(): Promise<void> {
    console.log('Starting feed sync job...');
    try {
      await this.syncService.syncAllUserFeeds();
      console.log('Feed sync job completed successfully');
    } catch (error) {
      console.error('Feed sync job failed:', error);
      throw error;
    }
  }
} 