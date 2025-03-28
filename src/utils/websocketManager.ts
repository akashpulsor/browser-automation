import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import config, { WebSocketConfig } from '../../config/websocket.config';
import { logger } from './logger';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Method to initialize WebSocket server with an existing HTTP server
  public initializeServer(httpServer: Server, options?: Partial<WebSocketConfig>) {
    const serverOptions = {
      ...config,
      ...options,
      server: httpServer
    };

    try {
      this.wss = new WebSocket.Server({ 
        server: httpServer,
        port: serverOptions.port 
      });

      this.setupListeners();
      logger.info(`WebSocket server initialized on port ${serverOptions.port}`);
    } catch (error) {
      logger.error('Failed to initialize WebSocket server', error);
      throw error;
    }
  }

  private setupListeners() {
    if (!this.wss) {
      logger.error('WebSocket server not initialized');
      return;
    }

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('WebSocket client connected');

      ws.on('message', (message: WebSocket.RawData, isBinary: boolean) => {
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

      ws.on('close', (code: number, reason: Buffer) => {
        logger.info('WebSocket client disconnected', { 
          code, 
          reason: reason.toString('utf8') 
        });
      });

      ws.on('error', (error: Error) => {
        logger.error('WebSocket client error', error);
      });
    });

    this.wss.on('error', (error: Error) => {
      logger.error('WebSocket server error', error);
    });
  }

  private handleMessage(message: any) {
    logger.info('Processed message:', message);
  }

  public broadcast(data: string | object) {
    if (!this.wss) {
      logger.error('Cannot broadcast: WebSocket server not initialized');
      return;
    }

    const messageToSend = typeof data === 'object' 
      ? JSON.stringify(data) 
      : data;

    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageToSend);
      }
    });
  }

  public getClients(): Set<WebSocket> {
    return this.wss ? this.wss.clients : new Set();
  }

  public close(callback?: (err?: Error) => void) {
    if (this.wss) {
      this.wss.close(callback);
    }
  }
}