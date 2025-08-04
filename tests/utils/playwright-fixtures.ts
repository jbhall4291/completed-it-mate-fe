// tests/utils/playwright-fixtures.ts
import { test as base, APIRequestContext, expect } from '@playwright/test';

type MyFixtures = {
  api: APIRequestContext;
};

export const test = base.extend<MyFixtures>({
  api: async ({ playwright }, use) => {
    const baseURL = 'https://completed-it-mate-be.onrender.com/api';
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        '[❌ FIXTURE ERROR] Missing NEXT_PUBLIC_API_KEY. Check your .env.local or dotenv setup.'
      );
    }

    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'x-api-key': apiKey,
      },
    });

    await use(apiContext);
    await apiContext.dispose();
  },
});

export { expect };
