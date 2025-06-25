import { jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { CrawlerService } from '../../src/services/crawler.service.js';
import { ICrawler } from '../../src/crawlers/base/crawler.js';

/**
 * 创建测试用的 mock Fastify 实例
 */
export function createMockFastifyInstance(crawlerService: CrawlerService): FastifyInstance {
  return {
    crawlerService,
    log: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  } as any;
}

/**
 * 创建测试用的 CrawlerService 实例
 */
export function createTestCrawlerService(crawler: ICrawler, platform = 'xiaohongshu'): CrawlerService {
  const crawlerService = new CrawlerService();
  crawlerService.registerCrawler(platform, crawler);
  return crawlerService;
}

/**
 * 生成唯一的测试用户数据
 */
export function generateTestUserData(platform = 'xiaohongshu', suffix = Date.now()) {
  return {
    platform,
    profileUrl: `https://www.xiaohongshu.com/user/profile/test-user-${suffix}?xsec_token=test-token-${suffix}`,
    followedAt: new Date(),
  };
}

/**
 * 生成测试用的用户资料数据
 */
export function generateTestUserProfile(overrides?: Partial<{
  name: string;
  username: string;
  avatar: string;
}>) {
  return {
    name: 'Test User',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    ...overrides,
  };
}

/**
 * 生成测试用的帖子数据
 */
export function generateTestPosts(count = 2, baseId = 'test-post') {
  return Array.from({ length: count }, (_, index) => ({
    businessId: `${baseId}-${index + 1}`,
    title: `Test Post ${index + 1}`,
    content: `This is test content ${index + 1}`,
    originalUrl: `https://www.xiaohongshu.com/explore/${baseId}-${index + 1}`,
    postedAt: new Date(`2024-01-0${index + 1}T10:00:00Z`),
  }));
} 