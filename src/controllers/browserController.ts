// src/controllers/browserController.ts
import { BrowserSessionManager } from '../services/browserSessionManager';
import { logger } from '../utils/logger';

export class BrowserController {
  private browserSessionManager: BrowserSessionManager;

  constructor() {
    this.browserSessionManager = new BrowserSessionManager();
  }

  async launchBrowser(url: string) {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      const session = await this.browserSessionManager.createSession(url);
      return { 
        message: 'Browser launched successfully', 
        sessionId: session.id 
      };
    } catch (error) {
      logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  async closeBrowser() {
    try {
      await this.browserSessionManager.closeSession();
      return { message: 'Browser closed successfully' };
    } catch (error) {
      logger.error('Failed to close browser', error);
      throw error;
    }
  }
}