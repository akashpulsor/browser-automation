// config/app.config.ts
export default {
    port: process.env.PORT || 3000,
    browserConfig: {
      headless: false, // Set to true for production
      defaultViewport: null,
      args: ['--start-maximized']
    }
  }