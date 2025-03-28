// config/websocket.config.ts
export interface WebSocketConfig {
    port: number;
    pingInterval?: number;
    reconnectDelay?: number;
  }
  
  const config: WebSocketConfig = {
    port: parseInt(process.env.WEBSOCKET_PORT || '8080', 10),
    pingInterval: 30000,
    reconnectDelay: 5000
  };
  
  export default config;