// src/services/websocketService.ts
import WebSocketClientManager  from '../utils/WebSocketClientManager';
import { logger } from '../utils/logger';

export default class WebSocketService {
  private wsManager: WebSocketClientManager;

  constructor() {
    this.wsManager = WebSocketClientManager.getInstance();
  }

  sendMessage(message: string) {
    try {
      this.wsManager.send(message);
      logger.info(`Sent WebSocket message: ${message}`);
    } catch (error) {
      logger.error('Failed to send WebSocket message', error);
    }
  }
}