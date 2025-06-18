import { XiaohongshuCrawler } from '../../../../src/crawlers/xiaohongshu/xiaohongshu-crawler';

describe('XiaohongshuCrawler', () => {
  let crawler: XiaohongshuCrawler;

  beforeEach(() => {
    crawler = new XiaohongshuCrawler('test-cookies');
  });

  describe('extractUserId', () => {
    it('should extract user ID from standard profile URL', () => {
      const profileUrl = 'https://www.xiaohongshu.com/user/profile/123456789';
      const userId = crawler['extractUserId'](profileUrl);
      expect(userId).toBe('123456789');
    });

    it('should extract user ID from URL with query parameters', () => {
      const profileUrl = 'https://www.xiaohongshu.com/user/profile/123456789?source=search';
      const userId = crawler['extractUserId'](profileUrl);
      expect(userId).toBe('123456789');
    });

    it('should extract user ID from URL with trailing slash', () => {
      const profileUrl = 'https://www.xiaohongshu.com/user/profile/123456789/';
      const userId = crawler['extractUserId'](profileUrl);
      expect(userId).toBe('123456789');
    });

    it('should handle empty URL path', () => {
      const profileUrl = 'https://www.xiaohongshu.com/';
      const userId = crawler['extractUserId'](profileUrl);
      expect(userId).toBe('');
    });

    it('should handle URL without user ID', () => {
      const profileUrl = 'https://www.xiaohongshu.com/user/profile/';
      const userId = crawler['extractUserId'](profileUrl);
      expect(userId).toBe('');
    });
  });

  describe('extractApiPathAndQuery', () => {
    it('should extract API path and query from standard profile URL', () => {
      const profileUrl = 'https://www.xiaohongshu.com/user/profile/123456789?xsec_token=ABGr3a7Fvra-zuhDlOlg4OW-sBDVzXLBxyWwpkXsdbHyY%3D';
      const apiPathAndQuery = crawler['extractApiPathAndQuery'](profileUrl);
      expect(apiPathAndQuery).toBe('/user/profile/123456789?xsec_token=ABGr3a7Fvra-zuhDlOlg4OW-sBDVzXLBxyWwpkXsdbHyY%3D');
    });
  });
});
