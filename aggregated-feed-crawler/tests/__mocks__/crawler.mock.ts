import { jest } from '@jest/globals';
import { ICrawler, UserProfile, Post } from '../../src/crawlers/base/crawler.js';

export interface MockCrawlerConfig {
  platform?: string;
  userProfile?: Partial<UserProfile>;
  posts?: Post[];
  cursor?: string;
  shouldThrowError?: boolean;
  errorMessage?: string;
}

export class MockCrawlerFactory {
  private mockFetchUserProfile: jest.MockedFunction<(profileUrl: string) => Promise<UserProfile>>;
  private mockFetchLatestPosts: jest.MockedFunction<(profileUrl: string, cursor: string) => Promise<{ posts: Post[]; cursor: string }>>;
  private mockSyncCookie: jest.MockedFunction<() => void>;

  constructor() {
    this.mockFetchUserProfile = jest.fn();
    this.mockFetchLatestPosts = jest.fn();
    this.mockSyncCookie = jest.fn();
  }

  /**
   * 创建默认的 mock crawler
   */
  createDefaultMock(): ICrawler {
    return {
      fetchUserProfile: this.mockFetchUserProfile,
      fetchLatestPosts: this.mockFetchLatestPosts,
      syncCookie: this.mockSyncCookie,
    };
  }

  /**
   * 配置 mock 行为
   */
  configure(config: MockCrawlerConfig): this {
    // 配置 fetchUserProfile
    if (config.shouldThrowError) {
      this.mockFetchUserProfile.mockRejectedValue(new Error(config.errorMessage || 'Mock error'));
    } else {
      const defaultProfile: UserProfile = {
        name: 'Mock User',
        username: 'mockuser',
        avatar: 'https://example.com/mock-avatar.jpg',
        ...config.userProfile,
      };
      this.mockFetchUserProfile.mockResolvedValue(defaultProfile);
    }

    // 配置 fetchLatestPosts
    if (config.shouldThrowError) {
      this.mockFetchLatestPosts.mockRejectedValue(new Error(config.errorMessage || 'Mock error'));
    } else {
      const defaultPosts: Post[] = config.posts || [
        {
          businessId: 'mock-post-1',
          title: 'Mock Post 1',
          content: 'This is mock content 1',
          originalUrl: 'https://example.com/mock-post-1',
          postedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          businessId: 'mock-post-2',
          title: 'Mock Post 2',
          content: 'This is mock content 2',
          originalUrl: 'https://example.com/mock-post-2',
          postedAt: new Date('2024-01-02T10:00:00Z'),
        },
      ];
      const cursor = config.cursor !== undefined ? config.cursor : 'mock-cursor';
      this.mockFetchLatestPosts.mockResolvedValue({ posts: defaultPosts, cursor });
    }

    // 配置 syncCookie
    this.mockSyncCookie.mockImplementation(() => {
      if (config.shouldThrowError) {
        throw new Error(config.errorMessage || 'Mock error');
      }
    });

    return this;
  }

  /**
   * 获取 mock 函数引用，用于测试验证
   */
  getMocks() {
    return {
      fetchUserProfile: this.mockFetchUserProfile,
      fetchLatestPosts: this.mockFetchLatestPosts,
      syncCookie: this.mockSyncCookie,
    };
  }

  /**
   * 清除所有 mock 状态
   */
  clearMocks(): this {
    this.mockFetchUserProfile.mockClear();
    this.mockFetchLatestPosts.mockClear();
    this.mockSyncCookie.mockClear();
    return this;
  }

  /**
   * 重置所有 mock 实现
   */
  resetMocks(): this {
    this.mockFetchUserProfile.mockReset();
    this.mockFetchLatestPosts.mockReset();
    this.mockSyncCookie.mockReset();
    return this;
  }
}

/**
 * 创建预设的 mock 配置
 */
export const MockCrawlerPresets = {
  /**
   * 成功场景的默认配置
   */
  success: (overrides?: Partial<MockCrawlerConfig>): MockCrawlerConfig => ({
    userProfile: {
      name: 'Test User',
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg',
    },
    posts: [
      {
        businessId: 'test-post-1',
        title: 'Test Post 1',
        content: 'This is test content 1',
        originalUrl: 'https://example.com/test-post-1',
        postedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        businessId: 'test-post-2',
        title: 'Test Post 2',
        content: 'This is test content 2',
        originalUrl: 'https://example.com/test-post-2',
        postedAt: new Date('2024-01-02T10:00:00Z'),
      },
    ],
    cursor: 'next-cursor-value',
    ...overrides,
  }),

  /**
   * 网络错误场景
   */
  networkError: (errorMessage = 'Network error'): MockCrawlerConfig => ({
    shouldThrowError: true,
    errorMessage,
  }),

  /**
   * API 错误场景
   */
  apiError: (errorMessage = 'API error'): MockCrawlerConfig => ({
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
 * 便捷函数：快速创建配置好的 mock crawler
 */
export function createMockCrawler(config?: MockCrawlerConfig): {
  crawler: ICrawler;
  mocks: ReturnType<MockCrawlerFactory['getMocks']>;
  factory: MockCrawlerFactory;
} {
  const factory = new MockCrawlerFactory();
  const crawler = factory.createDefaultMock();
  
  if (config) {
    factory.configure(config);
  }
  
  return {
    crawler,
    mocks: factory.getMocks(),
    factory,
  };
} 