import dotenv from 'dotenv';
dotenv.config();
import { CrawlerService } from './services/crawler.service.js';
import { SyncService } from './services/sync.service.js';
import { XiaohongshuCrawler } from './crawlers/xiaohongshu/xiaohongshu-crawler.js';
import { connectDB, disconnectDB} from './utils/db.js';
import { ProfileUpdateJob } from './jobs/profile-update-job.js';
import { FeedSyncJob } from './jobs/feed-sync-job.js';
import { CronJobManager } from './jobs/cron-job-manager.js'

const start = async () => {
  try {
    await connectDB();

    // Initialize services
    const crawlerService = CrawlerService.getInstance();
    crawlerService.registerCrawler('xiaohongshu', new XiaohongshuCrawler("abRequestId=12d67c77-c3b0-54dc-97dc-0ce87e04e92d; xsecappid=xhs-pc-web; a1=19555e764479hwh9d88g4uaklbsgdi4czahehdgk850000332233; webId=6f055f2110f421c2f0bd88d132f2daa9; gid=yj222dWKfju2yj222dWK40fk4WjxExjfYYk4xTY70T1DMd28kf34Sx888qqJJqq8W00W4qY0; webBuild=4.68.0; web_session=040069755df46f293e8766d57c3a4b2f7692f6; unread={%22ub%22:%22684d3f8e0000000023013fe1%22%2C%22ue%22:%2268470903000000002100dbd1%22%2C%22uc%22:18}; acw_tc=0ad5960217499962271544302eeebee5996b439db4a2ab2b095bc4ff363b22; websectiga=82e85efc5500b609ac1166aaf086ff8aa4261153a448ef0be5b17417e4512f28; sec_poison_id=165372ac-4dc3-4fcd-a3d2-e812a3dac1ec; loadts=1749996256662"));
    const syncService = new SyncService(crawlerService);

    // Initialize jobs
    const profileUpdateJob = new ProfileUpdateJob(syncService);
    const feedSyncJob = new FeedSyncJob(syncService);

    // Initialize and start cron job manager
    const cronJobManager = new CronJobManager(profileUpdateJob, feedSyncJob);
    cronJobManager.start();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

start(); 