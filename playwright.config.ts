import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    headless: false, // we want to SEE the browser
    launchOptions: {
      slowMo: 300, // 300ms delay between actions
    },
    viewport: { width: 1280, height: 720 },
  },
});
