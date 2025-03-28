// src/models/browserSession.ts
import { v4 as uuidv4 } from 'uuid';
import { Browser, Page } from 'puppeteer';

export  class BrowserSession {
  id: string;
  browser: Browser | null;
  page: Page | null;
  createdAt: Date;

  constructor() {
    this.id = uuidv4();
    this.browser = null;
    this.page = null;
    this.createdAt = new Date();
  }

  async initialize(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
    this.page = null;
    this.browser = null;
  }
}