import express from 'express';
import http from 'http';
import WebSocketClientManager  from './src/utils/WebSocketClientManager';
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
    initializeWebSocketServer();
    //await wsManager.connect();
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Function to initialize WebSocket server
const initializeWebSocketServer = async () => {
    while (true) {
        try {
        await wsManager.connect();
        logger.info('WebSocket server initialized successfully');
        } catch (error) {
        logger.error('Failed to initialize WebSocket server', error);
        throw error;
        }
    }
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


