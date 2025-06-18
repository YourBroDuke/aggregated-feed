import React from 'react';
import { Search, RefreshCw, Filter, Plus, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onRefresh: () => void;
  onOpenAddUser: () => void;
  onOpenFilters: () => void;
  isLoading: boolean;
  totalItems: number;
  filteredItemsCount: number;
  lastRefresh: Date;
}

export function Header({
  onRefresh,
  onOpenAddUser,
  onOpenFilters,
  isLoading,
  totalItems,
  filteredItemsCount,
  lastRefresh
}: HeaderProps) {
  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo和标题 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Rss className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">聚合信息流</h1>
            </div>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="secondary">
                {filteredItemsCount}/{totalItems} 条内容
              </Badge>
              <span>•</span>
              <span>最后更新: {formatLastRefresh(lastRefresh)}</span>
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFilters}
              className="hidden sm:flex"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAddUser}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加关注
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="relative"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">刷新</span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </Button>

            {/* 移动端菜单按钮 */}
            <div className="sm:hidden flex space-x-1">
              <Button variant="outline" size="sm" onClick={onOpenFilters}>
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenAddUser}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* 移动端统计信息 */}
        <div className="sm:hidden pb-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Badge variant="secondary">
              {filteredItemsCount}/{totalItems} 条内容
            </Badge>
            <span>最后更新: {formatLastRefresh(lastRefresh)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
