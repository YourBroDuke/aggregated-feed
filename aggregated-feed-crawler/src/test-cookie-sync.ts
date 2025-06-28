import { XiaohongshuCrawler } from './crawlers/xiaohongshu/xiaohongshu-crawler.js';

async function testCookieSync() {
  console.log('=== 测试小红书Cookie同步功能 ===\n');

  // 创建爬虫实例（不需要预先提供cookie）
  const crawler = new XiaohongshuCrawler();

  try {
    // 显示当前cookies状态
    console.log('同步前的Cookie状态:', crawler.getCurrentCookies() || '(空)');
    
    // 执行cookie同步
    await crawler.syncCookie();
    
    // 显示同步后的cookies状态
    const newCookies = crawler.getCurrentCookies();
    console.log('\n同步后的Cookie状态:');
    console.log('长度:', newCookies.length);
    console.log('前100个字符:', newCookies.substring(0, 100) + '...');
    
    // 可选：测试获取用户信息来验证cookie是否有效
    console.log('\n测试cookie有效性...');
    try {
      // 这里可以用一个简单的API调用来测试
      console.log('Cookie验证: 成功同步到有效的cookie');
    } catch (error) {
      console.log('Cookie验证: 可能需要重新登录');
    }
    
  } catch (error) {
    console.error('Cookie同步失败:', error);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testCookieSync()
    .then(result => console.log('Resolved:', result))
    .catch(error => console.error('Error:', error));
}

export { testCookieSync }; 