import cron from 'node-cron';
import { ProfileUpdateJob } from './profile-update-job.js';
import { FeedSyncJob } from './feed-sync-job.js';

export class CronJobManager {
  private profileUpdateJob: ProfileUpdateJob;
  private feedSyncJob: FeedSyncJob;

  constructor(profileUpdateJob: ProfileUpdateJob, feedSyncJob: FeedSyncJob) {
    this.profileUpdateJob = profileUpdateJob;
    this.feedSyncJob = feedSyncJob;
  }

  start(): void {
    // Run profile update job and feed sync job every day at 00:00
    cron.schedule('0 0 * * *', async () => {
      await this.profileUpdateJob.run().catch((error) => console.error('Profile update job failed:', error));
      await this.feedSyncJob.run().catch((error) => console.error('Feed sync job failed:', error));
    });

    console.log('Cron jobs started');
  }
} 