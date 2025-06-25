import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../../src/utils/db.js';
import { SyncService } from '../../../src/services/sync.service.js';
import { CrawlerService } from '../../../src/services/crawler.service.js';
import { FollowedUser } from '../../../src/models/FollowedUser.js';
import { FeedItem, IFeedItem } from '../../../src/models/FeedItem.js';
import { ICrawler, UserProfile, Post } from '../../../src/crawlers/base/crawler.js';

// Mock XiaohongshuCrawler
const mockFetchUserProfile = jest.fn<(profileUrl: string) => Promise<UserProfile>>();
const mockFetchLatestPosts = jest.fn<(profileUrl: string, cursor: string) => Promise<{ posts: Post[]; cursor: string }>>();
const mockSyncCookie = jest.fn();

const MockXiaohongshuCrawler = jest.fn().mockImplementation(() => ({
  fetchUserProfile: mockFetchUserProfile,
  fetchLatestPosts: mockFetchLatestPosts,
  syncCookie: mockSyncCookie,
}));

// Mock the actual XiaohongshuCrawler import
jest.mock('../../../src/crawlers/xiaohongshu/xiaohongshu-crawler.js', () => ({
  XiaohongshuCrawler: MockXiaohongshuCrawler,
}));

describe('SyncService Integration Tests', () => {
  let syncService: SyncService;
  let mockCrawler: ICrawler;

  beforeAll(async () => {
    await connectDB();
    
    // Create mock crawler
    mockCrawler = {
      fetchUserProfile: mockFetchUserProfile,
      fetchLatestPosts: mockFetchLatestPosts,
      syncCookie: mockSyncCookie,
    };

    const crawlerService = new CrawlerService();
    crawlerService.registerCrawler('xiaohongshu', mockCrawler);
    
    // Create a mock fastify instance for testing
    const mockFastify = {
      crawlerService,
      log: {
        error: console.error,
        info: console.log
      }
    } as any;
    
    syncService = new SyncService(mockFastify);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await FollowedUser.deleteMany({});
    await FeedItem.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should sync user profile successfully', async () => {
    // Create a unique test user for this test
    const testUser = await FollowedUser.create({
      platform: 'xiaohongshu',
      profileUrl: 'https://www.xiaohongshu.com/user/profile/test-user-1?xsec_token=test-token-1',
      followedAt: new Date(),
    });
    const testUserId = testUser._id;

    expect(testUser.name).toBeUndefined();
    expect(testUser.username).toBeUndefined();
    expect(testUser.avatar).toBeUndefined();

    // Mock the fetchUserProfile response
    const mockUserProfile: UserProfile = {
      name: 'Test User',
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg',
    };
    mockFetchUserProfile.mockResolvedValue(mockUserProfile);

    // Sync the user profile
    await syncService.syncUserProfile(testUserId);

    // Verify the mock was called with correct parameters
    expect(mockFetchUserProfile).toHaveBeenCalledWith(
      'https://www.xiaohongshu.com/user/profile/test-user-1?xsec_token=test-token-1'
    );

    // Verify the user profile was updated
    const updatedUser = await FollowedUser.findById(testUserId);
    console.log('Updated user:', updatedUser);
    expect(updatedUser?.name).toBe('Test User');
    expect(updatedUser?.username).toBe('testuser');
    expect(updatedUser?.avatar).toBe('https://example.com/avatar.jpg');
    expect(updatedUser?.syncStatus).toBeUndefined();
    expect(updatedUser?.syncCursor).toBeUndefined();
  });

  it('should sync user feeds successfully', async () => {
    // Create a unique test user for this test
    const testUser = await FollowedUser.create({
      platform: 'xiaohongshu',
      profileUrl: 'https://www.xiaohongshu.com/user/profile/test-user-2?xsec_token=test-token-2',
      followedAt: new Date(),
    });
    const testUserId = testUser._id;

    // 先补充用户profile字段，模拟已同步profile
    await FollowedUser.findByIdAndUpdate(testUserId, {
      name: 'Test User 2',
      username: 'testuser2',
      avatar: 'https://example.com/avatar2.jpg',
    });

    // Mock the fetchLatestPosts response
    const mockPosts: Post[] = [
      {
        businessId: 'xhs-test-post-1',
        title: 'Test Post 1',
        content: 'This is test content 1',
        originalUrl: 'https://www.xiaohongshu.com/explore/test-post-1',
        postedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        businessId: 'xhs-test-post-2',
        title: 'Test Post 2',
        content: 'This is test content 2',
        originalUrl: 'https://www.xiaohongshu.com/explore/test-post-2',
        postedAt: new Date('2024-01-02T10:00:00Z'),
      },
    ];
    const mockCursor = 'next-cursor-value';
    mockFetchLatestPosts.mockResolvedValue({ posts: mockPosts, cursor: mockCursor });

    // Sync the user feeds
    await syncService.syncUserFeeds(testUserId);

    // Verify the mock was called with correct parameters
    expect(mockFetchLatestPosts).toHaveBeenCalledWith(
      'https://www.xiaohongshu.com/user/profile/test-user-2?xsec_token=test-token-2',
      ''
    );

    // Verify that feed items were created
    const feedItems = await FeedItem.find({ 'author.userId': testUserId });
    expect(feedItems.length).toBe(2);

    // Verify all the fields of feed items
    feedItems.forEach((feedItem: IFeedItem, index: number) => {
      console.log(feedItem);
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

    // Verify the cursor was updated
    const updatedUser = await FollowedUser.findById(testUserId);
    expect(updatedUser?.syncCursor).toBe(mockCursor);
  });

  it('should handle fetchUserProfile error gracefully', async () => {
    // Create a unique test user for this test
    const testUser = await FollowedUser.create({
      platform: 'xiaohongshu',
      profileUrl: 'https://www.xiaohongshu.com/user/profile/test-user-3?xsec_token=test-token-3',
      followedAt: new Date(),
    });
    const testUserId = testUser._id;

    // Mock the fetchUserProfile to throw an error
    mockFetchUserProfile.mockRejectedValue(new Error('Network error'));

    // Sync the user profile should throw an error
    await expect(syncService.syncUserProfile(testUserId)).rejects.toThrow('Network error');

    // Verify the mock was called
    expect(mockFetchUserProfile).toHaveBeenCalled();
  });

  it('should handle fetchLatestPosts error gracefully', async () => {
    // Create a unique test user for this test
    const testUser = await FollowedUser.create({
      platform: 'xiaohongshu',
      profileUrl: 'https://www.xiaohongshu.com/user/profile/test-user-4?xsec_token=test-token-4',
      followedAt: new Date(),
    });
    const testUserId = testUser._id;

    // Mock the fetchLatestPosts to throw an error
    mockFetchLatestPosts.mockRejectedValue(new Error('API error'));

    // Sync the user feeds should throw an error
    await expect(syncService.syncUserFeeds(testUserId)).rejects.toThrow('API error');

    // Verify the mock was called
    expect(mockFetchLatestPosts).toHaveBeenCalled();
  });
});
