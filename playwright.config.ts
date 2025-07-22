import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    headless: false,        // show the browser
    launchOptions: {
      slowMo: 400,           // 400ms delay between actions
    },
    video: 'retain-on-failure',  // optional: record videos on failures
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
