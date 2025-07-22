import { test, expect } from '@playwright/test';

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
// Get the first add button (don’t tie it to "Add to Library" text)
  const firstAddButton = page.locator('button').first();

  // Click the button
  await firstAddButton.click();

  // Now expect its text to update dynamically
  await expect(firstAddButton).toHaveText('Game Added');

  // Check "Remove" button appears *within the same card*
  const parentCard = firstAddButton.locator('..'); // go up one level to card
  const removeButton = parentCard.getByRole('button', { name: 'Remove' });
  await expect(removeButton).toBeVisible();

  // Verify navbar badge increments
  let newCount = 0;
  if (await badge.isVisible()) {
    const updatedText = (await badge.textContent()) || '0';
    newCount = parseInt(updatedText, 10) || 0;
  }
  expect(newCount).toBe(initialNum + 1);
});