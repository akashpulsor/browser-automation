// src/services/websocketService.ts
import { WebSocketManager } from '../utils/websocketManager';
import { logger } from '../utils/logger';

export default class WebSocketService {
  private wsManager: WebSocketManager;

  constructor() {
    this.wsManager = WebSocketManager.getInstance();
  }

  sendMessage(message: string) {
    try {
      this.wsManager.broadcast(message);
      logger.info(`Sent WebSocket message: ${message}`);
    } catch (error) {
      logger.error('Failed to send WebSocket message', error);
    }
  }
}