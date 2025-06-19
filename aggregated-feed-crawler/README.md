# Aggregated Feed Crawler

本项目为独立可运行的聚合爬虫与同步服务，支持小红书等平台。

## 目录结构

- `src/` 主要源码
  - `crawlers/` 各平台爬虫实现
  - `services/` 爬虫注册与同步逻辑
- `package.json` 依赖与脚本
- `tsconfig.json` TypeScript配置

## 使用方法

### 安装依赖

```bash
pnpm install
```

### 开发模式运行

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 生产模式运行

```bash
pnpm start
```

## 入口

入口文件为 `src/index.ts`，可在此自定义注册crawler、调用同步逻辑等。

## 依赖
- axios
- mongoose
- node-cron
- typescript
- ts-node

如需扩展其他平台爬虫，可参考 `src/crawlers/` 目录下的实现。 