export interface FeedItemDTO {
  id: string;
  title: string;
  platform: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  originalUrl: string;
  postedAt: Date;
} 