import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header';
import { FeedList } from '@/components/FeedList';
import { FilterPanel } from '@/components/FilterPanel';
import { AddUserModal } from '@/components/AddUserModal';
import { useFeedData } from '@/hooks/useFeedData';
import './App.css';

function App() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const {
    platforms,
    feedItems,
    followedUsers,
    loading,
    error,
    lastRefresh,
    filters,
    refreshData,
    addFollowedUser,
    removeFollowedUser,
    updateFilters,
    clearFilters,
    totalItems,
    filteredItemsCount
  } = useFeedData();

  const handleAddUser = (user: any) => {
    addFollowedUser(user);
  };

  const handleRemoveUser = (userId: string) => {
    removeFollowedUser(userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />
      
      {/* 头部导航 */}
      <Header
        onRefresh={refreshData}
        onOpenAddUser={() => setIsAddUserModalOpen(true)}
        onOpenFilters={() => setIsFilterPanelOpen(true)}
        isLoading={loading}
        totalItems={totalItems}
        filteredItemsCount={filteredItemsCount}
        lastRefresh={lastRefresh}
      />

      {/* 主内容区域 */}
      <main className="pb-16">
        {/* Hero区域 */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/images/hero-bg.jpg" 
              alt="背景"
              className="w-full h-full object-cover opacity-10"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              智能聚合信息流
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              一站式浏览知乎、小红书、哔哩哔哩、Twitter、YouTube等平台的精选内容
            </p>
          </div>
        </div>

        {/* Feed内容列表 */}
        <FeedList
          items={feedItems}
          platforms={platforms}
          loading={loading}
          error={error}
          onRefresh={refreshData}
        />
      </main>

      {/* 筛选面板 */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        platforms={platforms}
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* 添加用户模态框 */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        platforms={platforms}
        followedUsers={followedUsers}
        onUserAdded={handleAddUser}
        onUserRemoved={handleRemoveUser}
      />

      {/* 消息提示组件 */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            fontSize: '14px'
          }
        }}
      />

      {/* 底部信息 */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>当前关注:</span>
              <span className="font-semibold text-blue-600">{followedUsers.length}</span>
              <span>个用户</span>
            </div>
            <div className="flex items-center gap-2">
              <span>总内容数:</span>
              <span className="font-semibold text-green-600">{totalItems}</span>
              <span>条</span>
            </div>
            <div className="flex items-center gap-2">
              <span>支持平台:</span>
              <span className="font-semibold text-purple-600">{platforms.length}</span>
              <span>个</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            聚合信息流 © 2025 - 让信息获取更高效
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;