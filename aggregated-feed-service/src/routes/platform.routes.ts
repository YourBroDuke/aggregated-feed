import { FastifyInstance } from 'fastify';
import { PlatformService } from '../services/platform.service.js';
import { PlatformDalImpl } from '../dal/platform-dal.js';

export default async function routes(fastify: FastifyInstance, options: any) {
  const platformService = new PlatformService(new PlatformDalImpl());

  fastify.get('/api/platforms', async (request, reply) => {
    const platforms = await platformService.getPlatforms();
    reply.send(platforms);
  });
} 