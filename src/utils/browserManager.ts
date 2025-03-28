// src/utils/browserManager.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import config from '../../config/app.config';
import { logger } from './logger';

export class BrowserManager {
  static async createBrowser(): Promise<Browser> {
    try {
      return await puppeteer.launch(config.browserConfig);
    } catch (error) {
      logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  static async createPage(browser: Browser): Promise<Page> {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      return page;
    } catch (error) {
      logger.error('Failed to create page', error);
      throw error;
    }
  }
}