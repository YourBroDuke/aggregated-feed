# 小红书Cookie自动同步功能

## 概述

现在xiaohongshu-crawler支持通过playwright自动获取和更新cookie，无需手动复制粘贴cookie。

## 功能特点

- 🔄 自动检测登录状态
- 📱 支持二维码扫码登录
- 💾 持久化保存登录状态
- 🔒 安全存储cookie和浏览器状态
- 🐳 Docker友好的数据存储

## 使用方法

### 1. 基本使用

```typescript
import { XiaohongshuCrawler } from './crawlers/xiaohongshu/xiaohongshu-crawler.js';

// 创建爬虫实例（无需预先提供cookie）
const crawler = new XiaohongshuCrawler();

// 同步cookie
await crawler.syncCookie();

// 正常使用爬虫功能
const profile = await crawler.fetchUserProfile(profileUrl);
const posts = await crawler.fetchLatestPosts(profileUrl, cursor);
```

### 2. 测试cookie同步

```bash
# 运行测试脚本
pnpm run test:cookie-sync
```

### 3. 登录流程

当运行`syncCookie()`时：

1. **已登录状态**：直接获取现有cookie
2. **未登录状态**：
   - 自动打开浏览器窗口
   - 寻找并点击登录按钮
   - 显示二维码（终端或浏览器中）
   - 用小红书App扫码登录
   - 等待登录成功
   - 自动保存cookie和登录状态

### 4. 数据存储

登录状态和cookie会保存在 `data/browser-session.json` 文件中，包含：

- Cookies
- LocalStorage数据  
- SessionStorage数据
- 浏览器状态

**注意**：`data/` 目录已添加到 `.gitignore` 中，不会被版本控制。

## API 变更

### 新增方法

```typescript
// 同步cookie（异步）
await crawler.syncCookie(): Promise<void>

// 获取当前cookie（用于调试）
crawler.getCurrentCookies(): string

// 手动设置cookie（保持向后兼容）
crawler.setCookies(cookies: string): void
```

### 构造函数更新

```typescript
// 之前：必须提供cookie
const crawler = new XiaohongshuCrawler(cookies);

// 现在：cookie可选，会通过syncCookie自动获取
const crawler = new XiaohongshuCrawler(); // 或者
const crawler = new XiaohongshuCrawler(cookies); // 仍然支持
```

## Docker 使用

在Docker环境中，确保挂载data目录：

```dockerfile
# 在docker-compose.yml或运行命令中
volumes:
  - ./data:/app/data
```

## 故障排除

### 1. 浏览器启动失败
```bash
# 确保安装了playwright浏览器
npx playwright install chromium
pnpm exec playwright install-deps
pnpm exec playwright install
```

### 2. 登录超时
- 默认等待60秒，可在代码中调整
- 确保网络连接正常
- 手动在浏览器中完成登录

### 3. Cookie失效
- 重新运行 `syncCookie()` 
- 删除 `data/browser-session.json` 强制重新登录

### 4. 权限问题
```bash
# 确保data目录有写权限
chmod 755 data/
```

## 安全注意事项

1. **敏感数据**：`data/` 目录包含登录凭证，请妥善保管
2. **网络安全**：仅在可信网络环境中使用
3. **定期更新**：建议定期更新cookie以保持登录状态

## 依赖

- `playwright`: 浏览器自动化
- `qrcode-terminal`: 终端二维码显示
- `@types/qrcode-terminal`: TypeScript类型支持 