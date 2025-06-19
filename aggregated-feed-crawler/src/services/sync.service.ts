import { CrawlerService } from './crawler.service.js';
import { FollowedUser } from '../models/FollowedUser.js';
import { FeedItem } from '../models/FeedItem.js';
import mongoose from 'mongoose';

export class SyncService {
  constructor(private crawlerService: CrawlerService) {}

  async syncCookie() {
    this.crawlerService.syncCookies();
  }

  async syncUserProfile(userId: mongoose.Types.ObjectId): Promise<void> {
    const user = await FollowedUser.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const crawler = this.crawlerService.getCrawler(user.platform);
    const profile = await crawler.fetchUserProfile(user.profileUrl);

    user.name = profile.name;
    user.username = profile.username;
    user.avatar = profile.avatar;

    await user.save();

    await FeedItem.updateMany({ 'author.userId': user._id }, { 'author.name': user.name, 'author.avatar': user.avatar, 'author.username': user.username }).catch((error) => {
      console.error(`Failed to update feed items for user ${user._id}:`, error);
    }); 
  }

  async syncUserFeeds(userId: mongoose.Types.ObjectId): Promise<void> {
    const user = await FollowedUser.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const crawler = this.crawlerService.getCrawler(user.platform);
    const { posts, cursor } = await crawler.fetchLatestPosts(user.profileUrl, user.syncCursor || "");

    for (const post of posts) {
      await FeedItem.findOneAndUpdate(
        { businessId: post.businessId },
        {
          ...post,
          author: {
            userId: user._id,
            name: user.name,
            avatar: user.avatar,
            username: user.username
          },
          platform: user.platform
        },
        { upsert: true, new: true }
      );
    }

    user.syncCursor = cursor;
    await user.save();
  }

  async syncAllUserProfiles(): Promise<void> {
    const users = await FollowedUser.find({ name: { $exists: false } });
    for (const user of users) {
      try {
        await this.syncUserProfile(user._id);
      } catch (error) {
        console.error(`Failed to sync profile for user ${user._id}:`, error);
        user.syncStatus = 'failed';
        await user.save();
      }
    }
  }

  async syncAllUserFeeds(): Promise<void> {
    const users = await FollowedUser.find();
    for (const user of users) {
      try {
        await this.syncUserFeeds(user._id);
      } catch (error) {
        console.error(`Failed to sync feeds for user ${user._id}:`, error);
        user.syncStatus = 'failed';
        await user.save();
      }
    }
  }
} 