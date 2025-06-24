import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

export default async function routes(fastify: FastifyInstance, options: any) {
  fastify.post('/api/sync/user-feeds', async (request, reply) => {
    try {
      const body = request.body as { userId: string };
      
      if (!body.userId) {
        return reply.status(400).send({
          success: false,
          error: 'userId is required'
        });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid userId format'
        });
      }

      const userId = new mongoose.Types.ObjectId(body.userId);
      await fastify.syncService.syncUserFeeds(userId);

      return reply.send({
        success: true,
        message: 'User feeds synced successfully'
      });
    } catch (error) {
      fastify.log.error('Error syncing user feeds:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  });
} 