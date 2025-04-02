import WebSocket from 'ws';
import config, { WebSocketClientConfig } from '../../config/websocket.config';
import { logger } from './logger';

export default class WebSocketClientManager {
  private static instance: WebSocketClientManager;
  private socket: WebSocket | null = null;
  private config: WebSocketClientConfig;
  private disconnectHandlers: Array<() => void> = [];

  private constructor(customConfig?: Partial<WebSocketClientConfig>) {
    this.config = {
      ...config,
      ...customConfig
    };
  }

  public static getInstance(customConfig?: Partial<WebSocketClientConfig>): WebSocketClientManager {
    if (!WebSocketClientManager.instance) {
      WebSocketClientManager.instance = new WebSocketClientManager(customConfig);
    }
    return WebSocketClientManager.instance;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Close existing connection if one exists
      if (this.socket) {
        this.disconnect();
      }

      try {
        this.socket = new WebSocket(this.config.url);

        this.socket.on('open', () => {
          logger.info(`WebSocket connected to ${this.config.url}`);
          resolve();
        });

        this.socket.on('error', (error) => {
          reject(error);
        });

        this.setupListeners();
      } catch (error) {
        logger.error('Failed to establish WebSocket connection', error);
        reject(error);
      }
    });
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('message', (message: WebSocket.RawData, isBinary: boolean) => {
      const messageStr = isBinary 
        ? message.toString('binary') 
        : message.toString('utf8');
      
      logger.info(`Received message: ${messageStr}`);
      
      try {
        const parsedMessage = JSON.parse(messageStr);
        this.handleMessage(parsedMessage);
      } catch (error) {
        logger.warn('Invalid JSON message', { message: messageStr });
      }
    });

    this.socket.on('close', (code: number, reason: Buffer) => {
      logger.info('WebSocket connection closed', { 
        code, 
        reason: reason.toString('utf8') 
      });
      // Trigger disconnect handlers
      this.disconnectHandlers.forEach(handler => handler());
    });

    this.socket.on('error', (error: Error) => {
      logger.error('WebSocket client error', error);
    });
  }

  private handleMessage(message: any) {
    logger.info('Processed message:', message);
    // Implement your message handling logic here
  }

  public send(data: string | object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logger.error('Cannot send: WebSocket not connected');
      return;
    }

    const messageToSend = typeof data === 'object' 
      ? JSON.stringify(data) 
      : data;

    this.socket.send(messageToSend);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Register disconnect handler
  public onDisconnect(handler: () => void): void {
    this.disconnectHandlers.push(handler);
  }

  // Get current configuration
  public getConfig(): WebSocketClientConfig {
    return { ...this.config };
  }

  // Update configuration
  public updateConfig(newConfig: Partial<WebSocketClientConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}