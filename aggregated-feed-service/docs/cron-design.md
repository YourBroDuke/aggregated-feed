# Cronjob Technical Design

## Overview
This document outlines the technical design for implementing cronjobs to handle automated tasks for user profile updates and feed item synchronization.

## Tasks

### 1. User Profile Update Task
- Scan FollowedUser collection for entries where name is empty
- Use profileUrl to fetch and update user information
- Update user profile data in the database

### 2. Feed Item Synchronization Task
- Scan all FollowedUser entries
- Fetch latest posts/tweets since last sync
- Update FeedItems collection with new content

## Key Decision

- Different platforms require different crawlers, so user information crawling and tweet fetching should be abstracted, exposing only interfaces to the cronjob.
- When fetching latest tweets, we should only fetch tweets between the last crawl time and now. This requires interface design considerations and potential DB model modifications.
- Trigger an immediate user info crawl when a new user is followed, eliminating dependency on scheduled tasks.
- FeedItem needs a new unique key to ensure idempotency.
- The specific crawler logic can be deferred; focus on completing the framework first.

## Technical Design

### 1. Database Schema Updates

#### FollowedUser Model Updates
```typescript
interface IFollowedUser extends Document {
  // ... existing fields ...
  lastSyncAt: Date;  // Track last successful sync time
  syncStatus: string; // Track sync status (pending, success, failed)
}
```

#### FeedItem Model Updates
```typescript
interface IFeedItem extends Document {
  // ... existing fields ...
  businessId: string;  // Platform-specific unique identifier for the post. {platform}-{id from platform sice}
}
```

### 2. Crawler Abstraction

#### Interface Design
```typescript
interface ICrawler {
  // User profile related methods
  fetchUserProfile(profileUrl: string): Promise<UserProfile>;
  
  // Feed item related methods
  fetchLatestPosts(
    profileUrl: string, 
    since: Date
  ): Promise<Post[]>;
}

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  description: string;
}

interface Post {
  businessId: string;  // Platform-specific unique identifier
  title: string;
  content: string;
  originalUrl: string;
  postedAt: Date;
}
```

### 3. Service Layer

#### CrawlerService
```typescript
class CrawlerService {
  private crawlers: Map<string, ICrawler>;
  
  constructor() {
    this.crawlers = new Map();
  }
  
  registerCrawler(platform: string, crawler: ICrawler): void;
  getCrawler(platform: string): ICrawler;
}
```

#### SyncService
```typescript
class SyncService {
  async syncUserProfile(userId: string): Promise<void>;
  async syncUserFeeds(userId: string): Promise<void>;
  async syncAllUserProfiles(): Promise<void>;
  async syncAllUserFeeds(): Promise<void>;
}
```

### 4. Cronjob Implementation

#### Profile Update Job
```typescript
class ProfileUpdateJob {
  async run(): Promise<void> {
    // Find users with empty names
    // For each user, fetch and update profile
    // Update sync status and lastSyncAt
  }
}
```

#### Feed Sync Job
```typescript
class FeedSyncJob {
  async run(): Promise<void> {
    // Get all followed users
    // For each user, fetch posts since lastSyncAt
    // Insert new posts into FeedItems
    // Update lastSyncAt
  }
}
```

### 5. Error Handling and Monitoring (in the future)

- Implement retry mechanism for failed syncs
- Log sync status and errors
- Implement monitoring for job execution
- Set up alerts for repeated failures

### 6. Implementation Phases

1. **Phase 1: Infrastructure Setup**
   - Set up cronjob framework
   - Implement crawler abstraction
   - Update database schemas

2. **Phase 2: Core Functionality**
   - Implement profile update job
   - Implement feed sync job
   - Add error handling

3. **Phase 3: Monitoring and Optimization**
   - Add monitoring
   - Implement retry mechanism
   - Optimize performance

## Directory Structure

```
src/
  ├── crawlers/
  │   ├── base/
  │   │   └── ICrawler.ts
  │   ├── twitter/
  │   │   └── TwitterCrawler.ts
  │   └── other-platforms/
  ├── jobs/
  │   ├── ProfileUpdateJob.ts
  │   └── FeedSyncJob.ts
  ├── services/
  │   ├── CrawlerService.ts
  │   └── SyncService.ts
  └── models/
      └── [updated models]
```

## Next Steps

1. Update database schemas
2. Implement crawler abstraction
3. Create base job classes
4. Implement specific crawlers for each platform
5. Set up cronjob scheduling
6. Test

## Notes

- The crawler implementation for specific platforms will be added later
- Consider implementing rate limiting for API calls
- Consider implementing caching for frequently accessed data
- Monitor database performance as the number of feed items grows 