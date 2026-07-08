import { Locator, Page } from '@playwright/test';

export class UserRowPage {
  readonly row: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page, userId: number) {
    this.row = page.locator('tr', { has: page.getByTestId(`user-${userId}-row`) });
    this.editButton = this.row.getByRole('button', { name: /edit user|edytuj użytkownika/i });
    this.deleteButton = this.row.getByRole('button', { name: /delete user|usuń użytkownika/i });
  }

  async edit(): Promise<void> {
    await this.editButton.click();
  }

  async delete(): Promise<void> {
    await this.deleteButton.click();
  }
}
