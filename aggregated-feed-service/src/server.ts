import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import platformsRoutes from './routes/platform.routes.js';
import feedRoutes from './routes/feed.routes.js';
import followedUsersRoutes from './routes/user.routes.js';
import { connectDB, disconnectDB, initPlatforms } from './utils/db.js';

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(fastifyCors);

// Routes
fastify.register(platformsRoutes);
fastify.register(feedRoutes);
fastify.register(followedUsersRoutes);

const start = async () => {
  try {
    await connectDB();
    await initPlatforms();

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
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