import { IFollowedUserDal } from '../dal/followed-user-dal.js';
import { FollowedUserDTO } from '../dto/FollowedUserDTO.js';
import { CrawlerService } from './crawler.service.js';
import { SyncService } from './sync.service.js';
import mongoose from 'mongoose';

export class UserService {
  private followedUserDal: IFollowedUserDal;

  constructor(followedUserDal: IFollowedUserDal) {
    this.followedUserDal = followedUserDal;
  }

  async getFollowedUsers(): Promise<FollowedUserDTO[]> {
    return await this.followedUserDal.getFollowedUsers();
  }

  async addFollowedUser(profileUrl: string): Promise<FollowedUserDTO> {
    let userId: string | undefined;
    try {
      const followedUser = await this.followedUserDal.addFollowedUser(profileUrl);
      userId = followedUser.id;
      return followedUser;
    } finally {
      if (userId) {
        const syncService = new SyncService(CrawlerService.getInstance());
        // Fire and forget the sync operation
        syncService.syncUserProfile(new mongoose.Types.ObjectId(userId))
          .catch(error => {
            console.error('Failed to sync user profile:', error);
          });
        syncService.syncUserFeeds(new mongoose.Types.ObjectId(userId))
          .catch(error => {
            console.error('Failed to sync user feeds:', error);
          });
      }
    }
  }

  async removeFollowedUser(userId: string): Promise<{ success: boolean }> {
    return await this.followedUserDal.removeFollowedUser(userId);
  }
} 