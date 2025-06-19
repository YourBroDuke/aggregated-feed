import { SyncService } from '../services/sync.service.js';

export class ProfileUpdateJob {
  constructor(private syncService: SyncService) {}

  async run(): Promise<void> {
    console.log('Starting profile update job...');
    try {
      await this.syncService.syncAllUserProfiles();
      console.log('Profile update job completed successfully');
    } catch (error) {
      console.error('Profile update job failed:', error);
      throw error;
    }
  }
} 