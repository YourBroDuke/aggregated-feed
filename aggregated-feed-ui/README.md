# 聚合信息流前端（aggregated-feed-ui）

## 项目简介

本项目是一个聚合信息流网站的前端部分，支持知乎、小红书、哔哩哔哩、Twitter、YouTube 五大平台的内容聚合展示。通过统一的数据结构和现代化的 UI 设计，为用户提供高效、便捷的多平台内容浏览与管理体验。

## 核心功能

- **多平台内容聚合**：支持知乎、小红书、哔哩哔哩、Twitter、YouTube，内容统一展示。
- **Feed流页面**：按时间倒序展示内容，支持平台图标、用户昵称、内容摘要、发布时间、原文链接等信息。
- **关注管理**：支持粘贴主页链接自动识别平台，批量添加/删除关注用户，展示用户详细信息。
- **智能筛选与搜索**：可按平台、内容类型、时间范围、热度等多维度筛选，支持关键词搜索。
- **响应式设计**：适配桌面端和移动端，交互友好，支持无障碍访问。

## 技术架构

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **样式方案**：TailwindCSS + Radix UI 组件库
- **图标库**：Lucide React
- **状态管理**：React Hooks + Context API
- **类型安全**：TypeScript 全面类型定义
- **数据管理**：静态 JSON 数据，fetch API 异步加载，完善的错误处理与性能优化

## 环境配置

### 依赖环境

- Node.js >= 18
- pnpm >= 8（推荐，需全局安装：`npm i -g pnpm`）

### 安装依赖

```bash
pnpm install --reporter=default
```

## 本地开发

```bash
pnpm dev
```
首次运行会自动安装依赖并启动开发服务器，访问 [http://localhost:5173](http://localhost:5173) 查看效果。

## 代码检查

```bash
pnpm lint
```

## 生产构建

```bash
pnpm build --reporter=default
```
构建产物会输出到 `dist/` 目录。

## 预览生产环境

```bash
pnpm preview --reporter=default
```
本地预览生产构建效果。

## 目录结构说明

- `src/`：主源码目录
- `public/`：静态资源与 mock 数据
- `dist/`：生产构建输出
- `components.json`：组件配置
- `tailwind.config.js`：TailwindCSS 配置
- `eslint.config.js`：ESLint 代码规范配置

## 其他说明

- 支持 `@` 别名指向 `src/` 目录，便于模块导入。
- 样式采用 TailwindCSS，支持暗色模式与动画。
- 代码规范基于 ESLint + TypeScript，推荐在开发前运行 `pnpm lint`。
