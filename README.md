# Aggregated Feed

Aggregated Feed is a full-stack project for aggregating and managing content streams from multiple platforms. It provides a unified backend API, a modern frontend UI, and supporting cron jobs for data synchronization. The project aims to solve the problem of content fragmentation across platforms like Xiaohongshu, Zhihu, Bilibili, Twitter, and YouTube, offering users a seamless, efficient, and centralized content consumption experience.

---

## Project Structure

```
aggregated-feed/
├── aggregated-feed-service/   # Backend service (Node.js + MongoDB)
├── aggregated-feed-ui/        # Frontend web app (React + Vite + TailwindCSS)
├── aggregated-feed-cookie/    # Cron job for cookie maintainance
├── aggregated-feed-bot/       # (Optional) Bot for automation/notifications
```

---

## 1. Backend Service (`aggregated-feed-service`)

- **Purpose:** Aggregates and manages content from multiple platforms, provides RESTful APIs for content retrieval and user following management. Data ingestion is handled by external processes (cron jobs).
- **Tech Stack:** Node.js 18+, TypeScript, MongoDB, Fastify, pnpm
- **Architecture:**
  - Layered design: API layer, Service layer, Data Access Layer (DAL), Crawler layer, Job layer
  - Read-only API for efficient content delivery; data writing handled externally
  - Single-user mode for simplicity
- **Key APIs:**
  - `GET /api/followed-users` — List followed users
  - `POST /api/followed-users` — Add a followed user
  - `DELETE /api/followed-users/:userId` — Remove a followed user
  - `GET /api/platforms` — List supported platforms
  - `GET /api/feed` — Get aggregated feed items (with filters)
- **Development & Deployment:**
  - Local: `pnpm install` → configure `.env` → `pnpm run dev`
  - Testing: `pnpm test`
  - Docker: `docker-compose up --build`
- **Docs:** See `aggregated-feed-service/docs/` for API, architecture, background, cron design, and more.

---

## 2. Frontend Web App (`aggregated-feed-ui`)

- **Purpose:** Modern, responsive web UI for browsing and managing aggregated content from multiple platforms.
- **Tech Stack:** React 18, TypeScript, Vite, TailwindCSS, Radix UI, Lucide React
- **Features:**
  - Unified feed display for Zhihu, Xiaohongshu, Bilibili, Twitter, YouTube
  - Feed sorted by time, with platform/user info, content summary, publish time, and original links
  - Follow management: auto-detect platform from pasted profile URL, batch add/remove, user details
  - Smart filtering: by platform, type, time, popularity, keyword search
  - Responsive design for desktop/mobile, accessibility support
- **Development:**
  - Install dependencies: `pnpm install`
  - Start dev server: `pnpm dev` (visit http://localhost:5173)
  - Lint: `pnpm lint`
  - Build: `pnpm build`
- **Directory:**
  - `src/` — main source code
  - `public/` — static assets and mock data
  - `dist/` — production build output

---

## 3. Cron Jobs & Data Sync for Crawler(`aggregated-feed-crawler`)

- **Purpose:** Periodically fetches and syncs user profiles and feed items from all supported platforms, ensuring up-to-date data in the backend service.
- **Design:**
  - Abstracted crawler interfaces for each platform
  - Profile update and feed sync jobs
  - Error handling, monitoring, and retry mechanisms
  - See `aggregated-feed-service/docs/cron-design.md` for technical details

---

## 4. Bot & Automation (`aggregated-feed-bot`)

- **Purpose:** (If present) Handles automation tasks such as notifications, cookie maintenance, or user interaction (e.g., via Telegram for authentication flows).
- **Design:**
  - Cookie maintenance system for crawlers (see `docs/cookie_maintainance.md`)
  - User interaction via messaging platforms

---

## Design Philosophy & Roadmap

- **Aggregation & Unification:** Centralizes fragmented content for a better user experience
- **Layered, Decoupled Architecture:** Clear separation of data collection, aggregation, and presentation
- **Extensibility:** Designed for future multi-user support, authentication, real-time updates, and more platforms
- **Developer Friendly:** Well-documented, easy to develop and deploy

---

## References & Documentation

- Backend API: `aggregated-feed-service/docs/api.md`
- Architecture: `aggregated-feed-service/docs/arc.md`
- Project background: `aggregated-feed-service/docs/background.md`
- Cron job design: `aggregated-feed-service/docs/cron-design.md`
- Cookie maintenance: `aggregated-feed-service/docs/cookie_maintainance.md`

---

For detailed development, deployment, or API usage, please refer to the README and docs in each submodule.
