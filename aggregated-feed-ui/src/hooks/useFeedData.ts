import { useState, useEffect, useMemo } from 'react';
import { Platform, FeedItem, FollowedUser, FilterOptions } from '@/types';
import { fetchPlatforms, fetchFeedData, fetchFollowedUsers } from '@/lib/api';

export function useFeedData() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // 筛选和搜索状态
  const [filters, setFilters] = useState<FilterOptions>({
    platforms: [],
    timeRange: 'all',
  });

  // 初始化数据加载
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [platformsData, feedData, usersData] = await Promise.all([
        fetchPlatforms(),
        fetchFeedData(),
        fetchFollowedUsers()
      ]);

      setPlatforms(platformsData);
      setFeedItems(feedData);
      setFollowedUsers(usersData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 手动刷新数据
  const refreshData = () => {
    loadAllData();
  };

  // 筛选和搜索逻辑
  const filteredFeedItems = useMemo(() => {
    let items = [...feedItems];

    // 平台筛选
    if (filters.platforms.length > 0) {
      items = items.filter(item => filters.platforms.includes(item.platform));
    }

    // 时间范围筛选
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeThreshold = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          timeThreshold.setHours(0, 0, 0, 0);
          break;
        case 'week':
          timeThreshold.setDate(now.getDate() - 7);
          break;
        case 'month':
          timeThreshold.setMonth(now.getMonth() - 1);
          break;
      }
      
      items = items.filter(item => new Date(item.postedAt) >= timeThreshold);
    }

    // 排序
    items.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    return items;
  }, [feedItems, filters]);

  // 添加关注用户
  const addFollowedUser = (user: FollowedUser) => {
    setFollowedUsers(prev => [...prev, user]);
  };

  // 移除关注用户
  const removeFollowedUser = (userId: string) => {
    setFollowedUsers(prev => prev.filter(user => user.id !== userId));
  };

  // 更新筛选选项
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 清除所有筛选
  const clearFilters = () => {
    setFilters({
      platforms: [],
      timeRange: 'all',
    });
  };

  return {
    // 数据
    platforms,
    feedItems: filteredFeedItems,
    followedUsers,
    loading,
    error,
    lastRefresh,
    
    // 筛选和搜索状态
    filters,
    
    // 操作函数
    refreshData,
    addFollowedUser,
    removeFollowedUser,
    updateFilters,
    clearFilters,
    
    // 统计信息
    totalItems: feedItems.length,
    filteredItemsCount: filteredFeedItems.length,
    platformsCount: platforms.length,
    followedUsersCount: followedUsers.length
  };
}
