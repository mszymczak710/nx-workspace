import { expect, test } from '../src/fixtures';
import { expectNoA11yViolations } from '../src/utils/axe';

test.describe('NotFound', () => {
  test('should show the not found page for an unknown route', async ({ page, notFoundPage }) => {
    await notFoundPage.goto('/this-route-does-not-exist');

    await expect(notFoundPage.heading).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test('should navigate back home from the not found page', async ({ page, notFoundPage }) => {
    await notFoundPage.goto('/this-route-does-not-exist');
    await notFoundPage.goHome();

    await expect(page).toHaveURL(/\/home/);
  });
});
