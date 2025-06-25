import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { 
  createMockXiaohongshuCrawler, 
  XiaohongshuMockPresets,
  createMockCrawler,
  MockCrawlerPresets,
  createTestCrawlerService,
  createMockFastifyInstance,
  generateTestUserData,
  generateTestUserProfile,
  generateTestPosts
} from './index.js';

// 这是一个示例文件，展示如何使用新的 mock 架构
// 实际项目中不需要这个文件

describe('Mock Architecture Example Usage', () => {
  let mockCrawlerInstance: ReturnType<typeof createMockXiaohongshuCrawler>;

  beforeAll(() => {
    // 创建 mock crawler 实例
    mockCrawlerInstance = createMockXiaohongshuCrawler();
  });

  beforeEach(() => {
    // 清除所有 mocks 状态
    mockCrawlerInstance.mockCrawler.clearMocks();
  });

  afterEach(() => {
    // 清理测试数据（如果有的话）
  });

  describe('Basic Usage Examples', () => {
    it('should demonstrate success scenario', async () => {
      // 使用预设的成功配置
      mockCrawlerInstance.mockCrawler.configure(
        XiaohongshuMockPresets.success()
      );

      // 模拟调用
      const { fetchUserProfile, fetchLatestPosts } = mockCrawlerInstance.mocks;
      
      // 模拟 fetchUserProfile 调用
      const userProfile = await fetchUserProfile('https://example.com/profile');
      expect(userProfile.name).toBe('小红书用户');
      expect(userProfile.username).toBe('xiaohongshu_user');

      // 模拟 fetchLatestPosts 调用
      const result = await fetchLatestPosts('https://example.com/profile', '');
      expect(result.posts).toHaveLength(2);
      expect(result.cursor).toBe('xhs-next-cursor');

      // 验证调用次数
      expect(fetchUserProfile).toHaveBeenCalledTimes(1);
      expect(fetchLatestPosts).toHaveBeenCalledTimes(1);
    });

    it('should demonstrate error scenario', async () => {
      // 使用预设的错误配置
      mockCrawlerInstance.mockCrawler.configure(
        XiaohongshuMockPresets.networkError('Network timeout')
      );

      const { fetchUserProfile } = mockCrawlerInstance.mocks;

      // 验证错误被正确抛出
      await expect(fetchUserProfile('https://example.com/profile'))
        .rejects.toThrow('Network timeout');
    });

    it('should demonstrate custom configuration', async () => {
      // 自定义配置
      const customUserProfile = generateTestUserProfile({
        name: 'Custom User',
        username: 'customuser',
        avatar: 'https://example.com/custom-avatar.jpg',
      });

      const customPosts = generateTestPosts(3, 'custom-post');

      mockCrawlerInstance.mockCrawler.configure({
        userProfile: customUserProfile,
        posts: customPosts,
        cursor: 'custom-cursor',
      });

      const { fetchUserProfile, fetchLatestPosts } = mockCrawlerInstance.mocks;

      // 验证自定义用户资料
      const userProfile = await fetchUserProfile('https://example.com/profile');
      expect(userProfile.name).toBe('Custom User');
      expect(userProfile.username).toBe('customuser');

      // 验证自定义帖子数据
      const result = await fetchLatestPosts('https://example.com/profile', '');
      expect(result.posts).toHaveLength(3);
      expect(result.posts[0].businessId).toBe('custom-post-1');
      expect(result.cursor).toBe('custom-cursor');
    });
  });

  describe('Advanced Usage Examples', () => {
    it('should demonstrate service integration', async () => {
      // 创建测试用的 CrawlerService
      const crawlerService = createTestCrawlerService(mockCrawlerInstance.crawler);
      
      // 创建 mock Fastify 实例
      const mockFastify = createMockFastifyInstance(crawlerService);

      // 配置 mock 行为
      mockCrawlerInstance.mockCrawler.configure(
        XiaohongshuMockPresets.success()
      );

      // 验证服务可以正确使用 mock crawler
      const crawler = crawlerService.getCrawler('xiaohongshu');
      expect(crawler).toBeDefined();

      // 模拟服务调用
      const userProfile = await crawler.fetchUserProfile('https://example.com/profile');
      expect(userProfile.name).toBe('小红书用户');
    });

    it('should demonstrate multiple test scenarios', async () => {
      const { fetchUserProfile, fetchLatestPosts } = mockCrawlerInstance.mocks;

      // 场景 1: 成功获取用户资料
      mockCrawlerInstance.mockCrawler.configure({
        userProfile: generateTestUserProfile({ name: 'User 1' }),
      });

      const profile1 = await fetchUserProfile('https://example.com/user1');
      expect(profile1.name).toBe('User 1');

      // 清除 mock 状态
      mockCrawlerInstance.mockCrawler.clearMocks();

      // 场景 2: 网络错误
      mockCrawlerInstance.mockCrawler.configure(
        XiaohongshuMockPresets.networkError('Connection failed')
      );

      await expect(fetchUserProfile('https://example.com/user2'))
        .rejects.toThrow('Connection failed');

      // 清除 mock 状态
      mockCrawlerInstance.mockCrawler.clearMocks();

      // 场景 3: 空数据
      mockCrawlerInstance.mockCrawler.configure(
        XiaohongshuMockPresets.emptyData()
      );

      const result = await fetchLatestPosts('https://example.com/user3', '');
      expect(result.posts).toHaveLength(0);
      expect(result.cursor).toBe('');
    });
  });

  describe('Generic Mock Usage', () => {
    it('should demonstrate generic mock crawler', async () => {
      // 使用通用的 mock crawler（不特定于小红书）
      const { crawler, mocks, factory } = createMockCrawler(
        MockCrawlerPresets.success()
      );

      const { fetchUserProfile, fetchLatestPosts } = mocks;

      // 测试用户资料获取
      const userProfile = await fetchUserProfile('https://example.com/profile');
      expect(userProfile.name).toBe('Test User');
      expect(userProfile.username).toBe('testuser');

      // 测试帖子获取
      const result = await fetchLatestPosts('https://example.com/profile', '');
      expect(result.posts).toHaveLength(2);
      expect(result.cursor).toBe('next-cursor-value');

      // 验证调用
      expect(fetchUserProfile).toHaveBeenCalledWith('https://example.com/profile');
      expect(fetchLatestPosts).toHaveBeenCalledWith('https://example.com/profile', '');
    });
  });
}); 