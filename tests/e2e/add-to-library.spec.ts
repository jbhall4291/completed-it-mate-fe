import { test, expect } from '../utils/playwright-fixtures';

test.beforeEach(async () => {
  const res = await fetch('https://completed-it-mate-be.onrender.com/api/test/reset-library', {
    method: 'DELETE',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
    },
  });

  expect(res.status).toBe(204);
});

test.afterAll(async () => {
  const res = await fetch('https://completed-it-mate-be.onrender.com/api/test/reset-library', {
    method: 'DELETE',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
    },
  });

  expect(res.status).toBe(204);
});

test('Add to Library updates button, shows remove, and increments navbar count', async ({ page }) => {
  // Go to the Games page
  await page.goto('http://localhost:3000/games');

  // Find the navbar badge (may not be visible yet)
  const badge = page.locator('nav span.bg-blue-500');
  let initialNum: number = 0;

  if (await badge.isVisible()) {
    const initialCount = (await badge.textContent()) || '0';
    initialNum = parseInt(initialCount, 10) || 0;
  }

  // Get the first game card and its add button
  const gameCard = page.locator('[data-testid="game-card"]').first();
  const addButton = gameCard.locator('button').first();

  // Click the "Add to Library" button
  await addButton.click();

  // After re-render, re-select the button and check updated label
  const updatedButton = gameCard.locator('button').first();
  await expect(updatedButton).toHaveText('Game Added');

  // Check that the "Remove" button is now visible in the same card
  const removeButton = gameCard.getByRole('button', { name: 'Remove' });
  await expect(removeButton).toBeVisible();

  // Verify navbar badge increments
  let newCount = 0;
  if (await badge.isVisible()) {
    const updatedText = (await badge.textContent()) || '0';
    newCount = parseInt(updatedText, 10) || 0;
  }

  expect(newCount).toBe(initialNum + 1);
});
