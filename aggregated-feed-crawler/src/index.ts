import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { connectDB, disconnectDB} from './utils/db.js';
import { ProfileUpdateJob } from './jobs/profile-update-job.js';
import { FeedSyncJob } from './jobs/feed-sync-job.js';
import { CronJobManager } from './jobs/cron-job-manager.js'
import feedRoutes from './routes/feed.routes.js';
import userRoutes from './routes/user.routes.js';
import servicesPlugin from './plugins/services.js';

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(fastifyCors);
fastify.register(servicesPlugin);

// Routes
fastify.register(feedRoutes);
fastify.register(userRoutes);

const start = async () => {
  try {
    await connectDB();

    // Initialize jobs with services from fastify
    const profileUpdateJob = new ProfileUpdateJob(fastify.syncService);
    const feedSyncJob = new FeedSyncJob(fastify.syncService);

    // Initialize and start cron job manager
    const cronJobManager = new CronJobManager(profileUpdateJob, feedSyncJob);
    cronJobManager.start();

    await fastify.listen({ port: 4001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

start(); 