import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CrawlerService } from '../services/crawler.service.js';
import { SyncService } from '../services/sync.service.js';
import { XiaohongshuCrawler } from '../crawlers/xiaohongshu/xiaohongshu-crawler.js';

declare module 'fastify' {
  interface FastifyInstance {
    crawlerService: CrawlerService;
    syncService: SyncService;
  }
}

const servicesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Initialize services
  const crawlerService = new CrawlerService();
  crawlerService.registerCrawler('xiaohongshu', new XiaohongshuCrawler());
  
  // Decorate fastify with crawlerService first
  fastify.decorate('crawlerService', crawlerService);
  
  // Initialize syncService with fastify instance
  const syncService = new SyncService(fastify);
  fastify.decorate('syncService', syncService);
};

export default servicesPlugin; 