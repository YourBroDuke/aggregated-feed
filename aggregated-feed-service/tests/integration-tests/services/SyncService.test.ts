import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../../src/utils/db.js';
import { SyncService } from '../../../src/services/sync.service.js';
import { CrawlerService } from '../../../src/services/crawler.service.js';
import { FollowedUser } from '../../../src/models/FollowedUser.js';
import { XiaohongshuCrawler } from '../../../src/crawlers/xiaohongshu/xiaohongshu-crawler.js';
import { FeedItem, IFeedItem } from '../../../src/models/FeedItem.js';

describe('SyncService Integration Tests', () => {
  let syncService: SyncService;
  let testUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectDB();
    const xiaohongshuCrawler = new XiaohongshuCrawler("abRequestId=12d67c77-c3b0-54dc-97dc-0ce87e04e92d; xsecappid=xhs-pc-web; a1=19555e764479hwh9d88g4uaklbsgdi4czahehdgk850000332233; webId=6f055f2110f421c2f0bd88d132f2daa9; gid=yj222dWKfju2yj222dWK40fk4WjxExjfYYk4xTY70T1DMd28kf34Sx888qqJJqq8W00W4qY0; webBuild=4.68.0; web_session=040069755df46f293e8766d57c3a4b2f7692f6; unread={%22ub%22:%22684d3f8e0000000023013fe1%22%2C%22ue%22:%2268470903000000002100dbd1%22%2C%22uc%22:18}; acw_tc=0ad5960217499962271544302eeebee5996b439db4a2ab2b095bc4ff363b22; websectiga=82e85efc5500b609ac1166aaf086ff8aa4261153a448ef0be5b17417e4512f28; sec_poison_id=165372ac-4dc3-4fcd-a3d2-e812a3dac1ec; loadts=1749996256662");
    const crawlerService = CrawlerService.getInstance();
    crawlerService.registerCrawler('xiaohongshu', xiaohongshuCrawler);
    syncService = new SyncService(crawlerService);

    const testUser = await FollowedUser.create({
      platform: 'xiaohongshu',
      profileUrl: 'https://www.xiaohongshu.com/user/profile/65b62088000000000d01d5f9?xsec_token=ABGr3a7Fvra-zuhDlOlg4OW-sBDVzXLBxyWwpkXsdbHyY%3D',
      followedAt: new Date(),
    });
    testUserId = testUser._id;

    expect(testUser.name).toBeUndefined();
    expect(testUser.username).toBeUndefined();
    expect(testUser.avatar).toBeUndefined();
    expect(testUser.syncStatus).toBeUndefined();
    expect(testUser.syncCursor).toBeUndefined();
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await FollowedUser.findByIdAndDelete(testUserId);
      await FeedItem.deleteMany({ 'author.userId': testUserId });
    }
    await disconnectDB();
  });

  it('should sync user profile successfully', async () => {
    // Sync the user profile
    await syncService.syncUserProfile(testUserId);

    // Verify the user profile was updated
    const updatedUser = await FollowedUser.findById(testUserId);
    console.log('Updated user:', updatedUser);
    expect(updatedUser?.name).toBeDefined();
    expect(updatedUser?.username).toBeDefined();
    expect(updatedUser?.avatar).toBeDefined();
    expect(updatedUser?.syncStatus).toBeUndefined();
    expect(updatedUser?.syncCursor).toBeUndefined();
  }, 60000);

  it('should sync user feeds successfully', async () => {
    // Sync the user feeds
    await syncService.syncUserFeeds(testUserId);

    // Verify that feed items were created
    const feedItems = await FeedItem.find({ 'author.userId': testUserId });
    expect(feedItems.length).toBeGreaterThan(0);

    // Verify all the fields of feed items
    feedItems.forEach((feedItem: IFeedItem) => {
      console.log(feedItem);
      expect(feedItem.businessId).toBeDefined();
      expect(feedItem.platform).toBe('xiaohongshu');
      expect(feedItem.author.userId.toString()).toEqual(testUserId.toString());
      expect(feedItem.author.name).toBeDefined();
      expect(feedItem.author.avatar).toBeDefined();
      expect(feedItem.author.username).toBeDefined();
      expect(feedItem.title).toBeDefined();
      expect(feedItem.content).toBeDefined();
      expect(feedItem.originalUrl).toContain('xiaohongshu.com');
      expect(feedItem.originalUrl).toContain('https://www.xiaohongshu.com/');
      expect(feedItem.postedAt).toBeDefined();
    });
  }, 60000);
});
