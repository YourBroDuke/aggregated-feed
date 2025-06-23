import { FastifyInstance } from 'fastify';
import { FeedItemDTO } from '../dto/FeedItemDTO.js';
import { FeedService } from '../services/feed.service.js';
import { FeedItemDalImpl } from '../dal/feed-item-dal.js';

export default async function routes(fastify: FastifyInstance, options: any) {
  const feedService = new FeedService(new FeedItemDalImpl());

  fastify.get('/api/feed', async (request, reply) => {
    const query = request.query as any;
    // 参数转换
    const params = {
      platforms: query.platforms ? query.platforms.split(',') : undefined,
      timeRange: query.timeRange,
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
    };
    const items: FeedItemDTO[] = await feedService.getFeedItems(params);
    reply.send(items);
  });
} 