import { IFeedItemDal } from '../dal/feed-item-dal.js';
import { FeedItemDTO } from '../dto/FeedItemDTO.js';

export class FeedService {
  private feedItemDal: IFeedItemDal;

  constructor(feedItemDal: IFeedItemDal) {
    this.feedItemDal = feedItemDal;
  }

  async getFeedItems(params: {
    platforms?: string[];
    timeRange?: 'all' | 'today' | 'week' | 'month';
    page?: number;
    pageSize?: number;
  }): Promise<FeedItemDTO[]> {
    return await this.feedItemDal.getFeedItems({
      platforms: params.platforms,
      timeRange: params.timeRange,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    });
  }
} 