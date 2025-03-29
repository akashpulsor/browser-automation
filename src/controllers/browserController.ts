// src/controllers/browserController.ts
import { BrowserSessionManager } from '../services/browserSessionManager';
import WebSocketClientManager  from '../utils/WebSocketClientManager';
import { logger } from '../utils/logger';

export class BrowserController {
  private browserSessionManager: BrowserSessionManager;
  private websocketClientManager: WebSocketClientManager;

  constructor() {
    this.browserSessionManager = new BrowserSessionManager();
    this.websocketClientManager = WebSocketClientManager.getInstance();
  }

  async launchBrowser(url: string) {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

        const session = await this.browserSessionManager.createSession(url);
        // Send data to WebSocket after launching the session
        const streamResult = await this.startStream(session.id, 100); // Stream every 100ms
        console.log(streamResult);
        
      return { 
        message: 'Browser launched successfully', 
        sessionId: session.id ,
        stream:streamResult
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

  async startStream(sessionId: string, frameInterval: number = 100) {
    try {
      const onFrame = (frameData: Buffer) => {
        if (this.websocketClientManager.isConnected()) {
          this.websocketClientManager.send(frameData); // Send the raw binary frame
        } else {
          logger.warn('WebSocket is not connected, cannot send frame.');
        }
      };

      await this.browserSessionManager.startStreaming(sessionId, frameInterval, onFrame);
      return { message: `Streaming started for session: ${sessionId}` };
    } catch (error) {
      logger.error('Failed to start streaming', error);
      throw error;
    }
  }
}