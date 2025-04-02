import express from 'express';
import http from 'http';
import WebSocketClientManager from './src/utils/WebSocketClientManager';
import browserRoutes from './src/routes/browserRoutes';
import config from './config/app.config';
import { logger } from './src/utils/logger';

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use('/browser', browserRoutes);

// Initialize WebSocket
const wsManager = WebSocketClientManager.getInstance();

// Start server
const startServer = async () => {
  try {
    // Initialize WebSocket with HTTP server
    await initializeWebSocketServer();
    
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Function to initialize WebSocket server with reconnection logic
const initializeWebSocketServer = async () => {
  try {
    await connectWithLoop();
    logger.info('WebSocket server initialized successfully');
    
    // Setup reconnection on disconnect
    wsManager.onDisconnect(() => {
      logger.warn('WebSocket disconnected, attempting to reconnect...');
      connectWithLoop();
    });
      
    // Setup global error handlers to reconnect if needed
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      // Only attempt reconnection if it's a WebSocket related error
      if (error.message && error.message.includes('WebSocket')) {
        connectWithLoop();
      }
    });
      
    process.on('unhandledRejection', (reason: any, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      // Only attempt reconnection if it's a WebSocket related error
      if (reason && reason.message && reason.message.includes('WebSocket')) {
        connectWithLoop();
      }
    });
      
  } catch (error) {
    logger.error('Failed to initialize WebSocket server', error);
    throw error;
  }
};

// Function to handle WebSocket connection with loop-based retry logic
const connectWithLoop = async (maxAttempts = 10000, initialDelay = 1000) => {
  let attempt = 1;
  let connected = false;
  
  while (!connected && attempt <= maxAttempts) {
    try {
      await wsManager.connect();
      logger.info('WebSocket connection established successfully');
      connected = true;
    } catch (error) {
      const delay = initialDelay * Math.pow(1.5, attempt - 1); // Exponential backoff
      
      logger.warn(`WebSocket connection failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`);
      
      // Use a promise-based setTimeout for async/await compatibility
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  if (!connected) {
    logger.error(`Failed to connect to WebSocket after ${maxAttempts} attempts.`);
    logger.info('Server will continue running without WebSocket functionality');
  }
  
  return connected;
};
  
// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message
  });
});

startServer();