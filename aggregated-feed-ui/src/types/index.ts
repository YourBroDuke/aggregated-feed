// 平台类型定义
export interface Platform {
  name: string;
  type: string;
  icon: string;
  color: string;
  backgroundColor: string;
  domain: string;
}

// 用户信息类型
export interface Author {
  name: string;
  avatar: string;
  username: string;
}

// 聚合内容类型
export interface FeedItem {
  id: string;
  title: string;
  platform: string;
  author: Author;
  content: string;
  originalUrl: string;
  postedAt: string;
}

// 关注用户类型
export interface FollowedUser {
  id: string;
  platform: string;
  username: string;
  name: string;
  avatar: string;
  profileUrl: string;
  followedAt: string;
}

// 筛选选项类型
export interface FilterOptions {
  platforms: string[];
  timeRange: 'all' | 'today' | 'week' | 'month';
}