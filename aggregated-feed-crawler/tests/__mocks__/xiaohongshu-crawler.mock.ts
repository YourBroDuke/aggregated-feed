import { jest } from '@jest/globals';
import { MockCrawlerFactory, MockCrawlerConfig } from './crawler.mock.js';

/**
 * 小红书爬虫的 Mock 类
 */
export class MockXiaohongshuCrawler {
  private factory: MockCrawlerFactory;

  constructor() {
    this.factory = new MockCrawlerFactory();
  }

  /**
   * 创建默认的小红书爬虫 mock
   */
  createMock() {
    return this.factory.createDefaultMock();
  }

  /**
   * 配置小红书特定的 mock 行为
   */
  configure(config: MockCrawlerConfig) {
    return this.factory.configure(config);
  }

  /**
   * 获取 mock 函数引用
   */
  getMocks() {
    return this.factory.getMocks();
  }

  /**
   * 清除 mock 状态
   */
  clearMocks() {
    return this.factory.clearMocks();
  }

  /**
   * 重置 mock 实现
   */
  resetMocks() {
    return this.factory.resetMocks();
  }
}

/**
 * 小红书爬虫的预设配置
 */
export const XiaohongshuMockPresets = {
  /**
   * 成功场景 - 小红书用户
   */
  success: (overrides?: Partial<MockCrawlerConfig>): MockCrawlerConfig => ({
    userProfile: {
      name: '小红书用户',
      username: 'xiaohongshu_user',
      avatar: 'https://example.com/xhs-avatar.jpg',
    },
    posts: [
      {
        businessId: 'xhs-test-post-1',
        title: '小红书测试帖子 1',
        content: '这是小红书测试内容 1',
        originalUrl: 'https://www.xiaohongshu.com/explore/xhs-test-post-1',
        postedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        businessId: 'xhs-test-post-2',
        title: '小红书测试帖子 2',
        content: '这是小红书测试内容 2',
        originalUrl: 'https://www.xiaohongshu.com/explore/xhs-test-post-2',
        postedAt: new Date('2024-01-02T10:00:00Z'),
      },
    ],
    cursor: 'xhs-next-cursor',
    ...overrides,
  }),

  /**
   * 网络错误场景
   */
  networkError: (errorMessage = '小红书网络错误'): MockCrawlerConfig => ({
    shouldThrowError: true,
    errorMessage,
  }),

  /**
   * API 错误场景
   */
  apiError: (errorMessage = '小红书 API 错误'): MockCrawlerConfig => ({
    shouldThrowError: true,
    errorMessage,
  }),

  /**
   * 空数据场景
   */
  emptyData: (): MockCrawlerConfig => ({
    posts: [],
    cursor: '',
  }),
};

/**
 * 创建小红书爬虫的 Jest mock
 */
export function createXiaohongshuJestMock() {
  const mockFetchUserProfile = jest.fn();
  const mockFetchLatestPosts = jest.fn();
  const mockSyncCookie = jest.fn();

  const MockXiaohongshuCrawler = jest.fn().mockImplementation(() => ({
    fetchUserProfile: mockFetchUserProfile,
    fetchLatestPosts: mockFetchLatestPosts,
    syncCookie: mockSyncCookie,
  }));

  return {
    MockXiaohongshuCrawler,
    mockFetchUserProfile,
    mockFetchLatestPosts,
    mockSyncCookie,
  };
}

/**
 * 便捷函数：快速创建配置好的小红书 mock crawler
 */
export function createMockXiaohongshuCrawler(config?: MockCrawlerConfig) {
  const mockCrawler = new MockXiaohongshuCrawler();
  const crawler = mockCrawler.createMock();
  
  if (config) {
    mockCrawler.configure(config);
  }
  
  return {
    crawler,
    mocks: mockCrawler.getMocks(),
    mockCrawler,
  };
} 