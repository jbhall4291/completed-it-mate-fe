//playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const isCI = process.env.CI === 'true'; // Are we running in GitHub Actions?

export default defineConfig({
  workers: 1,
  use: {
    headless: isCI,                  // Show browser locally, headless in CI
    launchOptions: {
      slowMo: isCI ? 0 : 300,        // Delay actions locally for debugging
    },
    viewport: { width: 1280, height: 720 },
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
