# 测试 Mock 架构

本目录包含了项目中所有测试相关的 mock 功能，采用可复用和封装良好的设计。

## 目录结构

```
tests/__mocks__/
├── index.ts                    # 统一导出文件
├── crawler.mock.ts            # 通用爬虫 mock 工厂
├── xiaohongshu-crawler.mock.ts # 小红书爬虫专用 mock
├── test-utils.ts              # 测试工具函数
└── README.md                  # 本文档
```

## 核心概念

### 1. MockCrawlerFactory

通用的爬虫 mock 工厂类，提供以下功能：

- 创建默认的 mock crawler 实例
- 配置 mock 行为（成功/失败/自定义数据）
- 管理 mock 状态（清除/重置）
- 获取 mock 函数引用用于验证

### 2. 预设配置 (Presets)

提供常用的 mock 配置预设：

- `success`: 成功场景的默认配置
- `networkError`: 网络错误场景
- `apiError`: API 错误场景
- `emptyData`: 空数据场景

### 3. 便捷函数

提供快速创建和配置 mock 的便捷函数：

- `createMockCrawler()`: 快速创建配置好的 mock crawler
- `createMockXiaohongshuCrawler()`: 小红书爬虫专用
- `createTestCrawlerService()`: 创建测试用的 CrawlerService
- `createMockFastifyInstance()`: 创建测试用的 Fastify 实例

## 使用方法

### 基本用法

```typescript
import { 
  createMockXiaohongshuCrawler, 
  XiaohongshuMockPresets,
  createTestCrawlerService,
  createMockFastifyInstance 
} from '../../__mocks__/index.js';

describe('My Test', () => {
  let mockCrawlerInstance: ReturnType<typeof createMockXiaohongshuCrawler>;

  beforeAll(() => {
    // 创建 mock crawler 实例
    mockCrawlerInstance = createMockXiaohongshuCrawler();
    
    // 创建测试服务
    const crawlerService = createTestCrawlerService(mockCrawlerInstance.crawler);
    const mockFastify = createMockFastifyInstance(crawlerService);
    
    // 初始化你的服务
    // myService = new MyService(mockFastify);
  });

  beforeEach(() => {
    // 清除 mock 状态
    mockCrawlerInstance.mockCrawler.clearMocks();
  });

  it('should work with success scenario', async () => {
    // 配置成功场景
    mockCrawlerInstance.mockCrawler.configure(
      XiaohongshuMockPresets.success()
    );

    // 执行测试
    // await myService.doSomething();

    // 验证 mock 调用
    const { fetchUserProfile } = mockCrawlerInstance.mocks;
    expect(fetchUserProfile).toHaveBeenCalled();
  });

  it('should handle error scenario', async () => {
    // 配置错误场景
    mockCrawlerInstance.mockCrawler.configure(
      XiaohongshuMockPresets.networkError('Custom error message')
    );

    // 执行测试并验证错误处理
    await expect(myService.doSomething()).rejects.toThrow('Custom error message');
  });
});
```

### 自定义配置

```typescript
// 自定义用户资料
mockCrawlerInstance.mockCrawler.configure({
  userProfile: {
    name: 'Custom User',
    username: 'customuser',
    avatar: 'https://example.com/custom-avatar.jpg',
  },
});

// 自定义帖子数据
const customPosts = [
  {
    businessId: 'custom-post-1',
    title: 'Custom Post',
    content: 'Custom content',
    originalUrl: 'https://example.com/custom-post',
    postedAt: new Date('2024-01-01T10:00:00Z'),
  },
];

mockCrawlerInstance.mockCrawler.configure({
  posts: customPosts,
  cursor: 'custom-cursor',
});
```

### 错误场景配置

```typescript
// 网络错误
mockCrawlerInstance.mockCrawler.configure(
  XiaohongshuMockPresets.networkError('Network timeout')
);

// API 错误
mockCrawlerInstance.mockCrawler.configure(
  XiaohongshuMockPresets.apiError('Rate limit exceeded')
);

// 自定义错误
mockCrawlerInstance.mockCrawler.configure({
  shouldThrowError: true,
  errorMessage: 'Custom error message',
});
```

## 最佳实践

### 1. 测试隔离

每个测试用例都应该：
- 使用唯一的测试数据（通过时间戳或随机数）
- 在 `beforeEach` 中清除 mock 状态
- 在 `afterEach` 中清理测试数据

### 2. Mock 配置

- 使用预设配置来保持一致性
- 只在需要时进行自定义配置
- 确保配置在测试执行前完成

### 3. 验证

- 验证 mock 函数被正确调用
- 验证调用参数的正确性
- 验证返回值的正确性

### 4. 错误处理

- 测试各种错误场景
- 验证错误消息的正确性
- 确保错误被正确传播

## 扩展

### 添加新的爬虫平台

1. 创建新的 mock 文件：`new-platform-crawler.mock.ts`
2. 继承或使用 `MockCrawlerFactory`
3. 添加平台特定的预设配置
4. 在 `index.ts` 中导出

### 添加新的测试工具

1. 在 `test-utils.ts` 中添加新的工具函数
2. 确保函数具有清晰的文档
3. 在 `index.ts` 中导出

## 注意事项

- 所有 mock 文件都应该使用 ES6 模块语法
- 确保 TypeScript 类型定义正确
- 保持 mock 行为的简单性和可预测性
- 避免在 mock 中包含复杂的业务逻辑 