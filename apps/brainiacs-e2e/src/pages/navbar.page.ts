import { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class NavbarPage extends BasePage {
  readonly logo: Locator;
  readonly languageToggle: Locator;
  readonly navbarToggler: Locator;
  readonly usersLink: Locator;
  readonly disabledHelpLink: Locator;

  constructor(page: Page) {
    super(page);

    this.logo = page.getByRole('link', { name: 'Brainiacs', exact: true });
    this.languageToggle = page.getByRole('button', { name: /polski|english/i });
    this.navbarToggler = page.getByRole('button', { name: /toggle navigation|przełącz nawigację/i });
    this.usersLink = page.getByRole('link', { name: /brainiacs list|mądrych ludzi/i });
    // Rendered with routerLink bound to `null` (disabled item), so Angular emits no `href` — the
    // element has no accessible "link" role to query by; this is the documented exception for
    // when a CSS/class locator is the only option.
    this.disabledHelpLink = page.locator('a.nav-link.disabled');
  }

  async goto(): Promise<void> {
    await super.goto('/home');
  }

  async navigateTo(link: Locator): Promise<void> {
    // Below the `lg` breakpoint the navbar collapses behind the toggler, hiding nav links until
    // it's expanded — the toggler itself is only visible in that collapsed layout.
    if (!(await link.isVisible()) && (await this.navbarToggler.isVisible())) {
      await this.toggleMobileMenu();
    }

    await link.click();
  }

  async openLanguageMenu(): Promise<void> {
    await this.languageToggle.click();
  }

  async switchToOtherLanguage(): Promise<void> {
    await this.openLanguageMenu();
    await this.page.locator('[ngbDropdownItem]').first().click();
  }

  async toggleMobileMenu(): Promise<void> {
    await this.navbarToggler.click();
  }
}
