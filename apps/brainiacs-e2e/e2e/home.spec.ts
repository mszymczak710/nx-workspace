import { expect, test } from '../src/fixtures';
import { expectNoA11yViolations } from '../src/utils/axe';

test.describe('Home', () => {
  test('should display the title and a button to users', async ({ page, homePage }) => {
    await homePage.goto();

    await expect(homePage.title).toBeVisible();
    await expect(homePage.goToUsersButton).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test('should navigate to the users page when clicking the button', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.navigateToUsers();

    await expect(page).toHaveURL(/\/users/);
  });
});
