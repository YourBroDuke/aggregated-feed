# Aggregated Feed Service Architecture

## System Overview

The Aggregated Feed Service is a Node.js-based application that aggregates social media feeds from various platforms (currently supporting Xiaohongshu) and provides a unified API for accessing the content.

## Architecture Diagram

```mermaid
graph TB
    subgraph Client
        API[API Client]
    end

    subgraph Server
        subgraph API Layer
            Routes[Fastify Routes]
        end

        subgraph Service Layer
            UserService[User Service]
            FeedService[Feed Service]
            PlatformService[Platform Service]
            SyncService[Sync Service]
            CrawlerService[Crawler Service]
        end

        subgraph Data Access Layer
            UserDal[User DAL]
            FeedDal[Feed DAL]
            PlatformDal[Platform DAL]
        end

        subgraph Crawler Layer
            ICrawler[ICrawler Interface]
            XiaohongshuCrawler[Xiaohongshu Crawler]
        end

        subgraph Job Layer
            CronJobManager[Cron Job Manager]
            ProfileUpdateJob[Profile Update Job]
            FeedSyncJob[Feed Sync Job]
        end

        subgraph Database
            MongoDB[(MongoDB)]
        end
    end

    API --> Routes
    Routes --> UserService
    Routes --> FeedService
    Routes --> PlatformService
    
    UserService --> UserDal
    FeedService --> FeedDal
    PlatformService --> PlatformDal
    
    UserDal --> MongoDB
    FeedDal --> MongoDB
    PlatformDal --> MongoDB
    
    UserService --> SyncService
    SyncService --> CrawlerService
    CrawlerService --> ICrawler
    ICrawler --> XiaohongshuCrawler
    
    CronJobManager --> ProfileUpdateJob
    CronJobManager --> FeedSyncJob
    ProfileUpdateJob --> SyncService
    FeedSyncJob --> SyncService
```

## Class Diagrams

### Service Layer

```mermaid
classDiagram
    class UserService {
        -followedUserDal: IFollowedUserDal
        +getFollowedUsers(): Promise<FollowedUserDTO[]>
        +addFollowedUser(profileUrl: string): Promise<FollowedUserDTO>
    }

    class FeedService {
        -feedItemDal: IFeedItemDal
        +getFeedItems(params: FeedQueryParams): Promise<FeedItemDTO[]>
    }

    class PlatformService {
        -platformDal: IPlatformDal
        +getPlatforms(): Promise<PlatformDTO[]>
    }

    class SyncService {
        -crawlerService: CrawlerService
        +syncUserProfile(userId: ObjectId): Promise<void>
        +syncUserFeeds(userId: ObjectId): Promise<void>
        +syncAllUserProfiles(): Promise<void>
        +syncAllUserFeeds(): Promise<void>
    }

    class CrawlerService {
        -crawlers: Map<string, ICrawler>
        +getInstance(): CrawlerService
        +registerCrawler(platform: string, crawler: ICrawler): void
        +syncCookies(): void
        +getCrawler(platform: string): ICrawler
    }
```

### Data Access Layer

```mermaid
classDiagram
    class IFollowedUserDal {
        <<interface>>
        +getFollowedUsers(): Promise<FollowedUserDTO[]>
        +addFollowedUser(profileUrl: string): Promise<FollowedUserDTO>
        +removeFollowedUser(userId: string): Promise<{success: boolean}>
    }

    class IFeedItemDal {
        <<interface>>
        +getFeedItems(params: FeedQueryParams): Promise<FeedItemDTO[]>
    }

    class IPlatformDal {
        <<interface>>
        +getPlatforms(): Promise<PlatformDTO[]>
    }

    class FollowedUserDalImpl {
        +getFollowedUsers(): Promise<FollowedUserDTO[]>
        +addFollowedUser(profileUrl: string): Promise<FollowedUserDTO>
        +removeFollowedUser(userId: string): Promise<{success: boolean}>
    }

    class FeedItemDalImpl {
        +getFeedItems(params: FeedQueryParams): Promise<FeedItemDTO[]>
    }

    class PlatformDalImpl {
        +getPlatforms(): Promise<PlatformDTO[]>
    }

    IFollowedUserDal <|.. FollowedUserDalImpl
    IFeedItemDal <|.. FeedItemDalImpl
    IPlatformDal <|.. PlatformDalImpl
```

### Crawler Layer

```mermaid
classDiagram
    class ICrawler {
        <<interface>>
        +syncCookie(): void
        +fetchUserProfile(profileUrl: string): Promise<UserProfile>
        +fetchLatestPosts(profileUrl: string, cursor: string): Promise<{posts: Post[], cursor: string}>
    }

    class XiaohongshuCrawler {
        -backEndUrl: string
        -cookies: string
        +syncCookie(): void
        +fetchUserProfile(profileUrl: string): Promise<UserProfile>
        +fetchLatestPosts(profileUrl: string, cursor: string): Promise<{posts: Post[], cursor: string}>
        -makeRequest(url: string, api: string, method: string, data?: any): Promise<any>
        -extractUserId(profileUrl: string): string
        -extractApiPathAndQuery(profileUrl: string): string
    }

    ICrawler <|.. XiaohongshuCrawler
```

### Job Layer

```mermaid
classDiagram
    class CronJobManager {
        -profileUpdateJob: ProfileUpdateJob
        -feedSyncJob: FeedSyncJob
        +start(): void
    }

    class ProfileUpdateJob {
        -syncService: SyncService
        +run(): Promise<void>
    }

    class FeedSyncJob {
        -syncService: SyncService
        +run(): Promise<void>
    }

    CronJobManager --> ProfileUpdateJob
    CronJobManager --> FeedSyncJob
    ProfileUpdateJob --> SyncService
    FeedSyncJob --> SyncService
```

## Key Components

1. **API Layer**
   - Fastify-based REST API
   - Routes for platforms, feeds, and user management
   - Input validation and error handling

2. **Service Layer**
   - Business logic implementation
   - Orchestration of data operations
   - Integration with crawler services

3. **Data Access Layer**
   - Interface-based design for data access
   - MongoDB implementation
   - Data transfer objects (DTOs) for API responses

4. **Crawler Layer**
   - Platform-specific crawler implementations
   - Cookie management
   - Profile and feed data extraction

5. **Job Layer**
   - Scheduled tasks for data synchronization
   - Profile updates and feed synchronization
   - Error handling and logging

## Data Flow

1. **Feed Aggregation Flow**
   - User adds a profile URL
   - System crawls the profile and initial feed
   - Regular sync jobs update the feed
   - API provides access to aggregated content

2. **Profile Update Flow**
   - Daily cron job triggers profile updates
   - System fetches latest profile information
   - Updates stored user data
   - Updates related feed items

3. **Feed Sync Flow**
   - Daily cron job triggers feed sync
   - System fetches latest posts
   - Updates feed items in database
   - Maintains sync cursor for incremental updates
