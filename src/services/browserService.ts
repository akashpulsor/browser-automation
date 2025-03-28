// src/services/browserService.ts
import { BrowserManager } from '../utils/browserManager';
import { BrowserSession } from '../models/browserSession';
import { logger } from '../utils/logger';

export  class BrowserService {
  private session: BrowserSession | null = null;

  async launchBrowser(url: string): Promise<BrowserSession> {
    try {
      const browser = await BrowserManager.createBrowser();
      const page = await BrowserManager.createPage(browser);
      
      this.session = new BrowserSession();
      await this.session.initialize(browser, page);

      await page.goto(url, { waitUntil: 'networkidle0' });
      logger.info(`Launched browser for URL: ${url}`);

      return this.session;
    } catch (error) {
      logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.session) {
      await this.session.close();
      this.session = null;
      logger.info('Browser session closed');
    }
  }

  getCurrentSession(): BrowserSession | null {
    return this.session;
  }
}