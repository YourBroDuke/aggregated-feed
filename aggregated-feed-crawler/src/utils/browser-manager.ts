import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import terminalImage from 'terminal-image';

export interface BrowserSession {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private dataDir: string;

  constructor(dataDir: string = 'data') {
    this.dataDir = dataDir;
  }

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // 创建浏览器上下文，可以加载已保存的状态
    const contextOptions: any = {
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    // 如果存在保存的状态，则加载
    const sessionPath = path.join(this.dataDir, 'browser-session.json');
    if (await this.fileExists(sessionPath)) {
      try {
        const sessionData = await this.loadSession();
        this.context = await this.browser.newContext(contextOptions);
        
        // 恢复cookies
        if (sessionData.cookies && sessionData.cookies.length > 0) {
          await this.context.addCookies(sessionData.cookies);
        }
        
        this.page = await this.context.newPage();
        
        // 恢复localStorage和sessionStorage
        if (sessionData.localStorage || sessionData.sessionStorage) {
          await this.page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
          
          if (sessionData.localStorage) {
            await this.page.evaluate((data) => {
              for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, value);
              }
            }, sessionData.localStorage);
          }
          
          if (sessionData.sessionStorage) {
            await this.page.evaluate((data) => {
              for (const [key, value] of Object.entries(data)) {
                sessionStorage.setItem(key, value);
              }
            }, sessionData.sessionStorage);
          }
        }
      } catch (error) {
        console.warn('Failed to load browser session, starting fresh:', error);
        this.context = await this.browser.newContext(contextOptions);
        this.page = await this.context.newPage();
      }
    } else {
      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage();
    }
  }

  async getXiaohongshuCookies(): Promise<string> {
    if (!this.page || !this.context) {
      throw new Error('Browser not initialized');
    }

    // 访问小红书主页
    await this.page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 检查是否已经登录
    const isLoggedIn = await this.checkLoginStatus();
    
    if (!isLoggedIn) {
      console.log('Not logged in, initiating login process...');
      await this.handleLogin();
    } else {
      console.log('Already logged in, retrieving cookies...');
    }

    // 获取cookies
    const cookies = await this.context.cookies();
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // 保存会话数据
    await this.saveSession();

    return cookieString;
  }

  private async checkLoginStatus(): Promise<boolean> {
    if (!this.page) return false;

    try {
      // 等待页面加载完成
      await this.page.waitForTimeout(5000);
      
      const loginButton = await this.page.$('#login-btn.reds-button-new.login-btn');
      return loginButton === null;
    } catch (error) {
      console.warn('Error checking login status:', error);
      return false;
    }
  }

  private async handleLogin(): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    try {

      let qrElement = await this.page.$('.qrcode-img');
      if (!qrElement) {
        console.log('未找到二维码元素，尝试点击登录按钮');
        // 寻找登录按钮
        const loginButton = await this.page.$('#login-btn.reds-button-new.login-btn');

        if (loginButton) {
          await loginButton.click();
          await this.page.waitForTimeout(2000);
        }

        qrElement = await this.page.$('#login-container.left.code-area.qrcode.qrcode-img');
      }

      if (qrElement) {
        console.log(`Found QR code using selector: ${qrElement}`);
        // 获取二维码URL或数据
        const qrSrc = await qrElement.getAttribute('src');
        if (qrSrc) {
          console.log('\n=== 扫描二维码登录 ===');
          console.log('请用小红书App扫描以下二维码：\n');
          
          if (qrSrc.startsWith('data:image/')) {
            try {
              // 将base64数据转换为Buffer
              const base64Data = qrSrc.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              
              // 在终端显示二维码图片
              const image = await terminalImage.buffer(buffer, {
                width: 100,
                height: 100
              });
              console.log(image);
            } catch (error) {
              console.error('显示二维码失败:', error);
              console.log('二维码源:', qrSrc.substring(0, 100) + '...');
              console.log('请在浏览器中查看二维码');
            }
          } else {
            console.log('二维码源:', qrSrc);
          }
        } else {
          console.log('未找到二维码图片源，请在浏览器中手动查看');
        }
      } else {
        console.log('未找到二维码元素，请在浏览器中手动完成登录');
        console.log('可能的原因：页面还在加载中或二维码元素结构发生了变化');
      }

      console.log('\n等待登录完成...');
      
      // 等待登录成功 - 检查URL变化或登录状态
      let loginSuccess = false;
      let attempts = 0;
      const maxAttempts = 60; // 等待最多60秒

      while (!loginSuccess && attempts < maxAttempts) {
        await this.page.waitForTimeout(1000);
        loginSuccess = await this.checkLoginStatus();
        attempts++;
        
        if (attempts % 10 === 0) {
          console.log(`等待登录中... (${attempts}/${maxAttempts})`);
        }
      }

      if (loginSuccess) {
        console.log('登录成功！');
      } else {
        throw new Error('登录超时，请重试');
      }

    } catch (error) {
      console.error('Login process failed:', error);
      throw error;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.context || !this.page) return;

    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      const cookies = await this.context.cookies();
      
      // 获取localStorage和sessionStorage
      const storageData = await this.page.evaluate(() => {
        const localStorage: Record<string, string> = {};
        const sessionStorage: Record<string, string> = {};
        
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            localStorage[key] = window.localStorage.getItem(key) || '';
          }
        }
        
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            sessionStorage[key] = window.sessionStorage.getItem(key) || '';
          }
        }
        
        return { localStorage, sessionStorage };
      });

      const sessionData: BrowserSession = {
        cookies: cookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as 'Strict' | 'Lax' | 'None' | undefined
        })),
        localStorage: storageData.localStorage,
        sessionStorage: storageData.sessionStorage
      };

      const sessionPath = path.join(this.dataDir, 'browser-session.json');
      await fs.writeFile(sessionPath, JSON.stringify(sessionData, null, 2));
      
      console.log('Browser session saved successfully');
    } catch (error) {
      console.error('Failed to save browser session:', error);
    }
  }

  private async loadSession(): Promise<BrowserSession> {
    const sessionPath = path.join(this.dataDir, 'browser-session.json');
    const data = await fs.readFile(sessionPath, 'utf-8');
    return JSON.parse(data);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 