// src/services/browserSessionManager.ts
import  {BrowserService} from './browserService';
import { BrowserSession } from '../models';
import  WebSocketService  from './websocketService';
import { logger } from '../utils/logger';

export class BrowserSessionManager {
  private browserService: BrowserService;
  private websocketService: WebSocketService;

  private sessions: Map<string, BrowserSession> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    this.browserService = new BrowserService();
    this.websocketService = new WebSocketService();
  }

  async createSession(url: string) {
    try {
      const session = await this.browserService.launchBrowser(url);

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

  async startStreaming(sessionId: string, frameInterval: number, onFrame: (frameData: Buffer) => void): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.page) {
      logger.error(`Session not found or page not initialized for ID: ${sessionId}`);
      return;
    }

    const page = session.page;

    const captureFrame = async () => {
      try {
        const screenshot = await page.screenshot({ encoding: 'binary' }) as Buffer;
        onFrame(screenshot);
        setTimeout(captureFrame, frameInterval);
      } catch (error) {
        logger.error('Error capturing or sending frame:', error);
        // Optionally stop the interval if an error occurs
      }
    };

    captureFrame();
    logger.info(`Streaming started for session: ${sessionId}`);
  }
}