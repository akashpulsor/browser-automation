export interface WebSocketClientConfig {
    url: string;
    reconnectAttempts: number;
    reconnectInterval: number;
  }
  
  export const defaultConfig: WebSocketClientConfig = {
    url: 'ws://localhost:8080/api/call/browser',
    reconnectAttempts: 5,
    reconnectInterval: 3000 // 3 seconds
  };
  
  // Export the default config as the default export
  const config = defaultConfig;
  export default config;