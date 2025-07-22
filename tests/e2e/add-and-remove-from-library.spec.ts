import { test, expect } from '@playwright/test';

test.only('User can add a game, then remove it from their library', async ({ page }) => {
  await page.goto('http://localhost:3000/games');

  // Badge may or may not be visible initially
  const badge = page.locator('nav span.bg-blue-500');
  let initialNum = 0;
  if (await badge.isVisible()) {
    initialNum = parseInt((await badge.textContent()) || '0', 10);
  }

  // Wait for game cards to render before interacting
  const firstGameCard = page.locator('[data-testid="game-card"]').first();
  await expect(firstGameCard).toBeVisible();

  // Grab the first button inside the card (don’t hardcode label)
  const addButton = firstGameCard.locator('button').first();

  // Click if it’s an "Add" button, otherwise continue (already added)
  const addButtonText = (await addButton.textContent())?.trim() || '';
  if (/Add to Library/i.test(addButtonText)) {
    console.log('Clicking Add to Library...');
    await addButton.click();
    await expect(addButton).toHaveText('Game Added');
  }

  // Get the game title from the card
  const gameTitle = (await firstGameCard.locator('h2').textContent())?.trim();
  if (!gameTitle) throw new Error('Game title was empty!');
  console.log('Game title detected:', gameTitle);

  // Wait for the badge to increment
  await expect(badge).toHaveText(String(initialNum + 1), { timeout: 3000 });

  console.log('Navigating to /library...');
  // Use a check for SPA navigation instead of a hard URL wait
  await page.click('text=My Library');
  await expect(page).toHaveURL(/\/library$/);

  console.log('Looking for game in library...');
  const gameCard = page.locator('div[data-testid="game-card"]').filter({ hasText: gameTitle }).first();
  await expect(gameCard).toBeVisible();

  console.log('Removing game...');
  const removeButton = gameCard.getByRole('button', { name: 'Remove from Library' });
  await removeButton.click();

 // Wait for badge to decrement back (or disappear if library is empty)
if (initialNum === 0) {
  await expect(badge).toHaveCount(0, { timeout: 3000 });
} else {
  await expect(badge).toHaveText(String(initialNum), { timeout: 3000 });
}
});
