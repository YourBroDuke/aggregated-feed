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
    const xiaohongshuCrawler = new XiaohongshuCrawler("abRequestId=12d67c77-c3b0-54dc-97dc-0ce87e04e92d; xsecappid=xhs-pc-web; a1=19555e764479hwh9d88g4uaklbsgdi4czahehdgk850000332233; webId=6f055f2110f421c2f0bd88d132f2daa9; gid=yj222dWKfju2yj222dWK40fk4WjxExjfYYk4xTY70T1DMd28kf34Sx888qqJJqq8W00W4qY0; webBuild=4.68.0; acw_tc=0a4acc4417502549314957828e69491f6e751e241f5637db41363223c8fe8a; websectiga=2a3d3ea002e7d92b5c9743590ebd24010cf3710ff3af8029153751e41a6af4a3; sec_poison_id=7d2a9c92-63d7-4b06-ab6b-f47637339b99; web_session=040069755df46f293e870c82673a4b4f9221da; loadts=1750256310189; unread={%22ub%22:%22683709a4000000002202a012%22%2C%22ue%22:%226848e00b000000002202704a%22%2C%22uc%22:29}");
    const crawlerService = new CrawlerService();
    crawlerService.registerCrawler('xiaohongshu', xiaohongshuCrawler);
    
    // Create a mock fastify instance for testing
    const mockFastify = {
      crawlerService,
      log: {
        error: console.error,
        info: console.log
      }
    } as any;
    
    syncService = new SyncService(mockFastify);

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
