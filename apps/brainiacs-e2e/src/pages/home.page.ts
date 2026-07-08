import { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly title: Locator;
  readonly goToUsersButton: Locator;

  constructor(page: Page) {
    super(page);

    this.title = page.getByRole('heading', { level: 1 });
    this.goToUsersButton = page.getByRole('button', { name: /go to users|przejdź do listy/i });
  }

  async goto(): Promise<void> {
    await super.goto('/home');
  }

  async navigateToUsers(): Promise<void> {
    await this.goToUsersButton.click();
  }
}
