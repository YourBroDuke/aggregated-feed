import { FollowedUserDTO } from '../dto/FollowedUserDTO.js';
import { FollowedUser, IFollowedUser } from '../models/FollowedUser.js';

export interface IFollowedUserDal {
  getFollowedUsers(): Promise<FollowedUserDTO[]>;
  addFollowedUser(profileUrl: string): Promise<FollowedUserDTO>;
  removeFollowedUser(userId: string): Promise<{ success: boolean; }>;
}

export class FollowedUserDalImpl implements IFollowedUserDal {
  async getFollowedUsers(): Promise<FollowedUserDTO[]> {
    const users = await FollowedUser.find();
    return users.map((u: IFollowedUser) => ({
      id: u._id.toString(),
      platform: u.platform,
      username: u.username || '',
      name: u.name || '',
      avatar: u.avatar || '',
      profileUrl: u.profileUrl,
      followedAt: u.followedAt,
    }));
  }

  async addFollowedUser(profileUrl: string): Promise<FollowedUserDTO> {
    const platform = this.extractPlatform(profileUrl);
    
    // Check if user already exists
    const existingUser = await FollowedUser.findOne({ profileUrl });
    if (existingUser) {
      const user = existingUser as IFollowedUser;
      
      return {
        id: user._id.toString(),
        platform: user.platform,
        username: user.username || '',
        name: user.name || '',
        avatar: user.avatar || '',
        profileUrl: user.profileUrl,
        followedAt: user.followedAt,
      };
    }

    const user = await FollowedUser.create({
      platform,
      profileUrl,
      followedAt: new Date(),
    }) as IFollowedUser;
    
    
    return {
      id: user._id.toString(),
      platform: user.platform,
      username: user.username || '',
      name: user.name || '',
      avatar: user.avatar || '',
      profileUrl: user.profileUrl,
      followedAt: user.followedAt,
    };
  }

  private extractPlatform(profileUrl: string): string {
    const url = new URL(profileUrl);
    // example1: https://www.xiaohongshu.com/user/profile/666666666666666666666666 -> xiaohongshu
    // example2: https://www.twitter.com/user/1234567890 -> twitter
    return url.hostname.split('.')[1];
  }

  async removeFollowedUser(userId: string): Promise<{ success: boolean }> {
    await FollowedUser.findByIdAndDelete(userId);
    return { success: true };
  }
}