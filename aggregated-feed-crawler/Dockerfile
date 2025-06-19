# 基础镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

# 安装 pnpm
RUN npm install -g pnpm@10.12.1 --registry=https://registry.npmmirror.com

# 安装依赖
RUN pnpm install --frozen-lockfile --reporter=default

# 复制源代码
COPY src/ ./src/
COPY .env.docker ./.env

# 构建 TypeScript
RUN pnpm build

# 生产镜像
FROM node:20-alpine AS runner
WORKDIR /app

# 仅复制生产依赖和构建产物
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

# 启动服务
CMD ["node", "dist/server.js"]