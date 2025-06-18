import { Platform, FeedItem, FollowedUser } from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

// 默认值常量
const DEFAULT_NAME = "anonymous-fish";
const DEFAULT_USERNAME = "anonymous-fish";
const DEFAULT_AVATAR = "https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_xl.jpg?source=32738c0c&needBackground=1";
const DEFAULT_DESCRIPTION = "being caught";

// 获取平台配置数据
export async function fetchPlatforms(): Promise<Platform[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/platforms`);
    if (!response.ok) {
      throw new Error('获取平台数据失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取平台数据时出错:', error);
    return [];
  }
}

// 获取聚合内容数据
export async function fetchFeedData(params?: {
  platforms?: string;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}): Promise<FeedItem[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.platforms) queryParams.append('platforms', params.platforms);
    if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/feed?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('获取Feed数据失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取Feed数据时出错:', error);
    return [];
  }
}

// 获取关注用户列表
export async function fetchFollowedUsers(): Promise<FollowedUser[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/followed-users`);
    if (!response.ok) {
      throw new Error('获取关注用户数据失败');
    }
    const userDatas = await response.json();
    console.log(userDatas);
    const newUserDatas = userDatas.map((user: FollowedUser) => ({
      ...user,
      name: user.name || DEFAULT_NAME,
      username: user.username || DEFAULT_USERNAME,
      avatar: user.avatar || DEFAULT_AVATAR,
    }));
    console.log(newUserDatas);
    return newUserDatas;
  } catch (error) {
    console.error('获取关注用户数据时出错:', error);
    return [];
  }
}

// 添加关注用户
export async function addFollowedUser(profileUrl: string): Promise<FollowedUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/followed-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '添加关注用户失败');
    }

    const userData = await response.json();
    
    // 检查并填充默认值
    return {
      ...userData,
      name: userData.name || DEFAULT_NAME,
      username: userData.username || DEFAULT_USERNAME,
      avatar: userData.avatar || DEFAULT_AVATAR,
      description: userData.description || DEFAULT_DESCRIPTION,
    };
  } catch (error) {
    console.error('添加关注用户时出错:', error);
    throw error;
  }
}

// 取消关注用户
export async function unfollowUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/followed-users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '取消关注用户失败');
    }

    return true;
  } catch (error) {
    console.error('取消关注用户时出错:', error);
    throw error;
  }
}

// 格式化时间显示
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return time.toLocaleDateString('zh-CN');
  }
}

// 格式化数字显示（如点赞数）
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 10000) {
    return `${(num / 1000).toFixed(1)}k`;
  } else if (num < 100000000) {
    return `${(num / 10000).toFixed(1)}万`;
  } else {
    return `${(num / 100000000).toFixed(1)}亿`;
  }
}
