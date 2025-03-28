// src/services/browserSessionManager.ts
import  {BrowserService} from './browserService';
import  WebSocketService  from './websocketService';
import { logger } from '../utils/logger';

export class BrowserSessionManager {
  private browserService: BrowserService;
  private websocketService: WebSocketService;

  constructor() {
    this.browserService = new BrowserService();
    this.websocketService = new WebSocketService();
  }

  async createSession(url: string) {
    try {
      const session = await this.browserService.launchBrowser(url);
      this.websocketService.sendMessage(JSON.stringify({
        type: 'SESSION_CREATED',
        sessionId: session.id
      }));
      return session;
    } catch (error) {
      logger.error('Failed to create browser session', error);
      throw error;
    }
  }

  async closeSession() {
    try {
      await this.browserService.closeBrowser();
      this.websocketService.sendMessage(JSON.stringify({
        type: 'SESSION_CLOSED'
      }));
    } catch (error) {
      logger.error('Failed to close browser session', error);
    }
  }
}