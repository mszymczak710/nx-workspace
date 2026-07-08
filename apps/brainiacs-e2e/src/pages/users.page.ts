import { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';
import { UserRowPage } from './user-row.page';

export class UsersPage extends BasePage {
  readonly addUserButton: Locator;
  readonly table: Locator;
  readonly pageSizeSelect: Locator;
  readonly pagination: Locator;
  readonly emptyRow: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    super(page);

    this.addUserButton = page.getByRole('button', { name: /dodaj|add/i });
    this.table = page.locator('table');
    this.pageSizeSelect = page.getByLabel(/items per page|liczba elementów/i);
    this.pagination = page.locator('ngb-pagination');
    this.emptyRow = page.locator('.empty-row');
    this.spinner = page.getByRole('status');
  }

  /**
   * Bootstrap animates a just-opened modal on two tracks: `.modal`'s `.fade` opacity transition
   * (150ms) and `.modal-dialog`'s separate slide-in `transform` transition (300ms, outlasts the
   * opacity fade). Interacting before both settle hits a still-animating, visually/positionally
   * unstable element (flaky click-interception, false color-contrast reads).
   */
  private async waitForModalStable(): Promise<void> {
    await this.page.waitForFunction(() => {
      const modal = document.querySelector('.modal.show');
      if (!modal) {
        return true;
      }
      if (getComputedStyle(modal).opacity !== '1') {
        return false;
      }

      const dialog = modal.querySelector<HTMLElement>('.modal-dialog');
      return !dialog || getComputedStyle(dialog).transform === 'none';
    });
  }

  async goto(): Promise<void> {
    await super.goto('/users');
  }

  row(userId: number): Locator {
    return this.table.locator('tr', { has: this.page.getByTestId(`user-${userId}-row`) });
  }

  userRow(userId: number): UserRowPage {
    return new UserRowPage(this.page, userId);
  }

  async openAddUserDialog(): Promise<void> {
    await this.addUserButton.click();
    await this.waitForModalStable();
  }

  async openEditUserDialog(userId: number): Promise<void> {
    await this.userRow(userId).edit();
    await this.waitForModalStable();
  }

  async openDeleteDialog(userId: number): Promise<void> {
    await this.userRow(userId).delete();
    await this.waitForModalStable();
  }

  async setPageSize(size: number): Promise<void> {
    await this.pageSizeSelect.selectOption(String(size));
  }

  async goToPage(page: number): Promise<void> {
    // Keyboard activation instead of a coordinate-based .click(): on narrow mobile viewports the
    // page can be wider than the viewport (long email/name columns), and pixel-coordinate hit
    // testing for the pagination link becomes unreliable near that overflow boundary. Focus +
    // Enter exercises the same click handler without depending on click-point geometry — and
    // doubles as keyboard-accessibility coverage for this control.
    const link = this.pagination.getByRole('link', { name: String(page) });
    await link.focus();
    await link.press('Enter');
  }
}
