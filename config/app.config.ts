// config/app.config.ts
export default {
    port: process.env.PORT || 3000,
    browserConfig: {
      headless: false, // Set to true for production
      defaultViewport: {
        width: 1920, // Or another sufficiently large width
        height: 1080, // Or another sufficiently large height
      },
      args: [
        '--start-maximized', // This tries to maximize the window
        `--window-size=${1920},${1080}`, // Explicitly set initial window size
      ],
    }
  }