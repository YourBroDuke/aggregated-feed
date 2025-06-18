import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { FeedCard, FeedCardSkeleton } from './FeedCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedItem, Platform } from '@/types';

interface FeedListProps {
  items: FeedItem[];
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function FeedList({ 
  items, 
  platforms, 
  loading, 
  error, 
  onRefresh 
}: FeedListProps) {
  const getPlatformInfo = (platform: string): Platform | undefined => {
    return platforms.find(p => p.type === platform);
  };

  // 错误状态
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              加载失败
            </h3>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <Button 
              onClick={onRefresh}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <FeedCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // 空状态
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              暂无内容
            </h3>
            <p className="text-gray-500 mb-6">
              当前筛选条件下没有找到匹配的内容，试试调整筛选条件或添加更多关注用户。
            </p>
            <Button 
              onClick={onRefresh}
              variant="outline"
            >
              刷新内容
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 正常内容列表
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* 内容提示 */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            共找到 <span className="font-semibold text-blue-600">{items.length}</span> 条内容
          </p>
        </div>

        {/* Feed列表 */}
        <div className="space-y-4">
          {items.map((item) => {
            const platform = getPlatformInfo(item.platform);
            if (!platform) {
              console.warn(`未找到平台信息: ${item.platform}`);
              return null;
            }
            
            return (
              <FeedCard 
                key={item.id} 
                item={item} 
                platform={platform} 
              />
            );
          })}
        </div>

        {/* 加载更多提示 */}
        {items.length > 0 && (
          <div className="text-center py-8">
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-3">
                  已显示所有内容
                </p>
                <Button 
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                >
                  刷新获取最新内容
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// 加载状态组件
export function FeedListLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <FeedCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
