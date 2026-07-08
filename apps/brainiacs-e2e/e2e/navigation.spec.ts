import { expect, test } from '../src/fixtures';

test.describe('Navigation', () => {
  test('should redirect the root path to the users list', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/users$/);
  });

  test('should navigate to the users page via the navbar', async ({ page, navbarPage }) => {
    await navbarPage.goto();
    await navbarPage.navigateTo(navbarPage.usersLink);

    await expect(page).toHaveURL(/\/users/);
  });

  test('should navigate home when clicking the logo', async ({ page, navbarPage }) => {
    await navbarPage.goto();
    await navbarPage.navigateTo(navbarPage.usersLink);
    await expect(page).toHaveURL(/\/users/);

    await navbarPage.navigateTo(navbarPage.logo);

    await expect(page).toHaveURL(/\/home/);
  });

  test('should render the Help link as disabled and non-interactive', async ({ navbarPage }) => {
    await navbarPage.goto();

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await navbarPage.navbarToggler.isVisible()) {
      await navbarPage.toggleMobileMenu();
    }

    // `pointer-events: none` (Bootstrap's `.disabled`) means a real click would never land, so
    // the disabled contract is verified via state, not a `.click()` that could never resolve.
    await expect(navbarPage.disabledHelpLink).toBeVisible();
    await expect(navbarPage.disabledHelpLink).not.toHaveAttribute('href');
    await expect(navbarPage.disabledHelpLink).toHaveCSS('pointer-events', 'none');
  });

  test('should switch the language when selecting the other option', async ({ page, navbarPage }) => {
    await navbarPage.goto();
    await expect(navbarPage.languageToggle).toBeVisible();

    const langBefore = await page.locator('html').getAttribute('lang');

    await navbarPage.switchToOtherLanguage();

    await expect(page.locator('html')).not.toHaveAttribute('lang', langBefore ?? '');
  });

  test.describe('Document title', () => {
    test('should set a translated title per route', async ({ page, navbarPage }) => {
      await navbarPage.goto();
      await expect(page).toHaveTitle(/^strona główna$|^home$/i);

      await navbarPage.navigateTo(navbarPage.usersLink);
      await expect(page).toHaveTitle(/lista mądrych ludzi|brainiacs list/i);
    });

    test('should translate the title after a language switch instead of leaking the raw key', async ({ page, navbarPage }) => {
      await navbarPage.goto();
      await expect(page).toHaveTitle(/^strona główna$|^home$/i);

      await navbarPage.switchToOtherLanguage();

      // A raw, untranslated key (e.g. "home.pageTitle") would never match this pattern — regression
      // guard for a bug where switching languages left the title permanently stuck on the key
      // because it was read via the synchronous `translate()` before the new language's
      // translation file had finished loading.
      await expect(page).toHaveTitle(/^strona główna$|^home$/i);
    });
  });

  test.describe('Mobile menu', () => {
    test('should be collapsed by default and expand via the toggler', async ({ navbarPage, isMobile }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(!isMobile, 'the navbar only collapses below the lg breakpoint');

      await navbarPage.goto();

      await expect(navbarPage.navbarToggler).toHaveAttribute('aria-expanded', 'false');
      await expect(navbarPage.usersLink).toBeHidden();

      await navbarPage.toggleMobileMenu();

      await expect(navbarPage.navbarToggler).toHaveAttribute('aria-expanded', 'true');
      await expect(navbarPage.usersLink).toBeVisible();
    });
  });
});
