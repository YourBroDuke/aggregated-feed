# Aggregated Feed Service

A backend service that aggregates and manages content from multiple platforms. This service provides APIs for content retrieval and user following management, while data ingestion is handled by external processes.

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB

### Setup

1. Clone the repository:
```bash
git clone git@github.com:YourBroDuke/aggregated-feed-service.git
cd aggregated-feed-service
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment:
```bash
cp .env.example .env
```
Edit `.env` to set your MongoDB connection string:
```
MONGODB_URL=mongodb://localhost:27017/aggregated-feed
```

4. Start development server:
```bash
pnpm run dev
```

## Testing

Run the test suite:
```bash
pnpm test
```

For watch mode during development:
```bash
pnpm test:watch
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Build and start the services:
```bash
docker-compose up --build
```

### Manual Docker Build

1. Build the image:
```bash
docker build -t aggregated-feed-service .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env.docker aggregated-feed-service
```

## API Documentation

For detailed API specifications, please refer to [API_SPEC.md](./API_SPEC.md).

## Notes
- This service is designed for single-user mode and does not include authentication.
- Data ingestion/writing is handled by external processes, not through this API. 