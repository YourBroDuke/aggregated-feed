import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { connectDB, disconnectDB } from '../../../src/utils/db.js';
import { SyncService } from '../../../src/services/sync.service.js';
import { FollowedUser } from '../../../src/models/FollowedUser.js';
import { FeedItem, IFeedItem } from '../../../src/models/FeedItem.js';
import { 
  createMockXiaohongshuCrawler, 
  XiaohongshuMockPresets,
  createTestCrawlerService,
  createMockFastifyInstance,
  generateTestUserData,
  generateTestUserProfile,
  generateTestPosts
} from '../../__mocks__/index.js';

// Mock the actual XiaohongshuCrawler import
jest.mock('../../../src/crawlers/xiaohongshu/xiaohongshu-crawler.js', () => {
  const { createXiaohongshuJestMock } = require('../../__mocks__/xiaohongshu-crawler.mock.js');
  return createXiaohongshuJestMock();
});

describe('SyncService Integration Tests', () => {
  let syncService: SyncService;
  let mockCrawlerInstance: ReturnType<typeof createMockXiaohongshuCrawler>;

  beforeAll(async () => {
    await connectDB();
    
    // 创建 mock crawler 实例
    mockCrawlerInstance = createMockXiaohongshuCrawler();
    
    // 创建 crawler service 并注册 mock crawler
    const crawlerService = createTestCrawlerService(mockCrawlerInstance.crawler);
    
    // 创建 mock fastify 实例
    const mockFastify = createMockFastifyInstance(crawlerService);
    
    syncService = new SyncService(mockFastify);
  });

  beforeEach(() => {
    // 清除所有 mocks 状态
    mockCrawlerInstance.mockCrawler.clearMocks();
  });

  afterEach(async () => {
    // 清理测试数据
    await FollowedUser.deleteMany({});
    await FeedItem.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should sync user profile successfully', async () => {
    // 创建测试用户
    const testUserData = generateTestUserData('xiaohongshu', 1);
    const testUser = await FollowedUser.create(testUserData);
    const testUserId = testUser._id;

    // 验证初始状态
    expect(testUser.name).toBeUndefined();
    expect(testUser.username).toBeUndefined();
    expect(testUser.avatar).toBeUndefined();

    // 配置 mock 返回成功响应
    const mockUserProfile = generateTestUserProfile({
      name: 'Test User',
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg',
    });
    mockCrawlerInstance.mockCrawler.configure({
      userProfile: mockUserProfile,
    });

    // 同步用户资料
    await syncService.syncUserProfile(testUserId);

    // 验证 mock 被正确调用
    const { fetchUserProfile } = mockCrawlerInstance.mocks;
    expect(fetchUserProfile).toHaveBeenCalledWith(testUserData.profileUrl);

    // 验证用户资料被更新
    const updatedUser = await FollowedUser.findById(testUserId);
    expect(updatedUser?.name).toBe('Test User');
    expect(updatedUser?.username).toBe('testuser');
    expect(updatedUser?.avatar).toBe('https://example.com/avatar.jpg');
    expect(updatedUser?.syncStatus).toBeUndefined();
    expect(updatedUser?.syncCursor).toBeUndefined();
  });

  it('should sync user feeds successfully', async () => {
    // 创建测试用户
    const testUserData = generateTestUserData('xiaohongshu', 2);
    const testUser = await FollowedUser.create(testUserData);
    const testUserId = testUser._id;

    // 先补充用户 profile 字段，模拟已同步 profile
    const mockUserProfile = generateTestUserProfile({
      name: 'Test User 2',
      username: 'testuser2',
      avatar: 'https://example.com/avatar2.jpg',
    });
    await FollowedUser.findByIdAndUpdate(testUserId, mockUserProfile);

    // 配置 mock 返回成功响应
    const mockPosts = generateTestPosts(2, 'xhs-test-post');
    const mockCursor = 'next-cursor-value';
    mockCrawlerInstance.mockCrawler.configure({
      posts: mockPosts,
      cursor: mockCursor,
    });

    // 同步用户 feeds
    await syncService.syncUserFeeds(testUserId);

    // 验证 mock 被正确调用
    const { fetchLatestPosts } = mockCrawlerInstance.mocks;
    expect(fetchLatestPosts).toHaveBeenCalledWith(testUserData.profileUrl, '');

    // 验证 feed items 被创建
    const feedItems = await FeedItem.find({ 'author.userId': testUserId });
    expect(feedItems.length).toBe(2);

    // 验证所有 feed item 字段
    feedItems.forEach((feedItem: IFeedItem, index: number) => {
      expect(feedItem.businessId).toBe(mockPosts[index].businessId);
      expect(feedItem.platform).toBe('xiaohongshu');
      expect(feedItem.author.userId.toString()).toEqual(testUserId.toString());
      expect(feedItem.author.name).toBe('Test User 2');
      expect(feedItem.author.avatar).toBe('https://example.com/avatar2.jpg');
      expect(feedItem.author.username).toBe('testuser2');
      expect(feedItem.title).toBe(mockPosts[index].title);
      expect(feedItem.content).toBe(mockPosts[index].content);
      expect(feedItem.originalUrl).toBe(mockPosts[index].originalUrl);
      expect(feedItem.postedAt).toEqual(mockPosts[index].postedAt);
    });

    // 验证 cursor 被更新
    const updatedUser = await FollowedUser.findById(testUserId);
    expect(updatedUser?.syncCursor).toBe(mockCursor);
  });

  it('should handle fetchUserProfile error gracefully', async () => {
    // 创建测试用户
    const testUserData = generateTestUserData('xiaohongshu', 3);
    const testUser = await FollowedUser.create(testUserData);
    const testUserId = testUser._id;

    // 配置 mock 抛出错误
    mockCrawlerInstance.mockCrawler.configure(
      XiaohongshuMockPresets.networkError('Network error')
    );

    // 同步用户资料应该抛出错误
    await expect(syncService.syncUserProfile(testUserId)).rejects.toThrow('Network error');

    // 验证 mock 被调用
    const { fetchUserProfile } = mockCrawlerInstance.mocks;
    expect(fetchUserProfile).toHaveBeenCalled();
  });

  it('should handle fetchLatestPosts error gracefully', async () => {
    // 创建测试用户
    const testUserData = generateTestUserData('xiaohongshu', 4);
    const testUser = await FollowedUser.create(testUserData);
    const testUserId = testUser._id;

    // 配置 mock 抛出错误
    mockCrawlerInstance.mockCrawler.configure(
      XiaohongshuMockPresets.apiError('API error')
    );

    // 同步用户 feeds 应该抛出错误
    await expect(syncService.syncUserFeeds(testUserId)).rejects.toThrow('API error');

    // 验证 mock 被调用
    const { fetchLatestPosts } = mockCrawlerInstance.mocks;
    expect(fetchLatestPosts).toHaveBeenCalled();
  });
});
