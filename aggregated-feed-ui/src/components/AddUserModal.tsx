import React, { useState } from 'react';
import { Plus, Loader2, ExternalLink, User, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { FollowedUser, Platform } from '@/types';
import { addFollowedUser, unfollowUser } from '@/lib/api';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  followedUsers: FollowedUser[];
  onUserAdded: (user: FollowedUser) => void;
  onUserRemoved: (userId: string) => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  platforms,
  followedUsers,
  onUserAdded,
  onUserRemoved
}: AddUserModalProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 示例链接
  const exampleUrls = [
    'https://zhihu.com/people/tech_explorer',
    'https://xiaohongshu.com/user/profile/foodie_diary',
    'https://space.bilibili.com/programmer_azhi',
    'https://twitter.com/tech_insider',
    'https://youtube.com/@creative_designer_wang'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileUrl.trim()) {
      toast.error('请输入用户主页链接');
      return;
    }

    // 检查是否已经关注
    const existingUser = followedUsers.find(user => user.profileUrl === profileUrl.trim());
    if (existingUser) {
      toast.error('该用户已在关注列表中');
      return;
    }

    setIsLoading(true);
    
    try {
      const newUser = await addFollowedUser(profileUrl.trim());
      if (newUser) {
        onUserAdded(newUser);
        setProfileUrl('');
        toast.success(`成功添加关注用户: ${newUser.name}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加关注失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (user: FollowedUser) => {
    try {
      await unfollowUser(user.id);
      onUserRemoved(user.id);
      toast.success(`已取消关注: ${user.name}`);
    } catch (error) {
      toast.error('取消关注失败');
    }
  };

  const groupedUsers = platforms.map(platform => ({
    platform,
    users: followedUsers.filter(user => user.platform === platform.type)
  })).filter(group => group.users.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>管理关注用户</span>
          </DialogTitle>
          <DialogDescription>
            添加新的关注用户或管理现有的关注列表
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 添加用户表单 */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="profileUrl">用户主页链接</Label>
                  <Input
                    id="profileUrl"
                    type="url"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    placeholder="输入用户主页链接..."
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    支持知乎、小红书、哔哩哔哩、Twitter、YouTube平台
                  </p>
                </div>

                {/* 示例链接 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">示例链接：</Label>
                  <div className="mt-2 space-y-1">
                    {exampleUrls.map((url, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setProfileUrl(url)}
                        className="justify-start h-auto p-2 text-left"
                        disabled={isLoading}
                      >
                        <span className="text-xs text-blue-600 hover:text-blue-800 truncate">
                          {url}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !profileUrl.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      正在添加...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      添加关注
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* 关注用户列表 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">当前关注 ({followedUsers.length})</h3>
            </div>

            {followedUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">暂无关注用户</p>
                  <p className="text-sm text-gray-400 mt-1">
                    添加用户开始聚合他们的最新内容
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groupedUsers.map(({ platform, users }) => (
                  <div key={platform.type}>
                    <div className="flex items-center space-x-2 mb-3">
                      <img 
                        src={platform.icon} 
                        alt={platform.name}
                        className="w-5 h-5 object-contain"
                      />
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <Badge variant="secondary">{users.length}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {users.map((user) => (
                        <Card key={user.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900 truncate">
                                      {user.name}
                                    </h5>
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">
                                    @{user.username}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(user.profileUrl, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose}>
            完成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
