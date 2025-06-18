import { FeedItemDTO } from '../dto/FeedItemDTO.js';
import { FeedItem, IFeedItem } from '../models/FeedItem.js';

export class FeedItemDalImpl implements IFeedItemDal {
  async getFeedItems(params: {
    platforms?: string[];
    timeRange?: 'all' | 'today' | 'week' | 'month';
    page?: number;
    pageSize?: number;
  }): Promise<FeedItemDTO[]> {
    const {
      platforms,
      timeRange,
      page = 1,
      pageSize = 20,
    } = params;

    const query: any = {};
    if (platforms && platforms.length > 0) {
      query.platform = { $in: platforms };
    }
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let from: Date | undefined;
      if (timeRange === 'today') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (timeRange === 'week') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (from) {
        query.postedAt = { $gte: from };
      }
    }

    const items = await FeedItem.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return items.map((i: IFeedItem) => ({
      id: i._id.toString(),
      platform: i.platform,
      title: i.title || '',
      author: {
        name: i.author.name || '',
        avatar: i.author.avatar || '',
        username: i.author.username || '',
      },
      content: i.content,
      originalUrl: i.originalUrl,
      postedAt: i.postedAt,
    }));
  }
}

export interface IFeedItemDal {
  getFeedItems(params: {
    platforms?: string[];
    timeRange?: 'all' | 'today' | 'week' | 'month';
    page?: number;
    pageSize?: number;
  }): Promise<FeedItemDTO[]>;
}
