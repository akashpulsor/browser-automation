// src/controllers/browserController.ts
import { BrowserSessionManager } from '../services/browserSessionManager';
import WebSocketClientManager  from '../utils/WebSocketClientManager';
import { getPageMetadata, PageMetadata } from '../utils/pageMetadataUtils';
import express, { Request } from 'express';
import { logger } from '../utils/logger';

export class BrowserController {
  private browserSessionManager: BrowserSessionManager;
  private websocketClientManager: WebSocketClientManager;

  constructor() {
    this.browserSessionManager = new BrowserSessionManager();
    this.websocketClientManager = WebSocketClientManager.getInstance();
  }

  async launchBrowser(req: Request) {
    const { url, sessionId,portalId,llmId, browserSessionId } = req.body;
    try {
      if (!url) {
        throw new Error('URL is required');
      }

        const session = await this.browserSessionManager.createSession(url);
        const page = session.page;

        if (page) {
            const metadata = await getPageMetadata(page, true);
            if (this.websocketClientManager.isConnected()) {
                let res = {
                    type: 'initialSessionData',
                    browserRunId: session.id,
                    sessionId: sessionId,
                    portalId:portalId,
                    llmId: llmId,
                    browserSessionId: browserSessionId,
                    launchedUrl: url,
                    timestamp: new Date().toISOString(),
                    metadata:metadata
                    // Consider sending the full element list and DOM snapshot in chunks or on demand
                  };
                console.log(res);  
                this.websocketClientManager.send(res);
                logger.info(`Sent initial session data with info for elements (limited), DOM snapshot snippet, and screenshot (limited) to WebSocket`, { sessionId: session.id });
              } else {
                logger.warn('WebSocket is not connected, cannot send initial session data.');
              }
        }

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