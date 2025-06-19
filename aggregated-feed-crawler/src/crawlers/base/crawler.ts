export interface UserProfile {
  name?: string;
  username?: string;
  avatar?: string;
}

export interface Post {
  businessId: string;  // Platform-specific unique identifier
  title: string;
  content: string;
  originalUrl: string;
  postedAt: Date;
}

export interface ICrawler {
  // Cookie related methods
  syncCookie(): void;

  // User profile related methods
  fetchUserProfile(profileUrl: string): Promise<UserProfile>;
  
  // Feed item related methods
  fetchLatestPosts(
    profileUrl: string, 
    cursor: string
  ): Promise<{ posts: Post[], cursor: string }>;
} 