import { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class NotFoundPage extends BasePage {
  readonly heading: Locator;
  readonly goHomeButton: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading');
    this.goHomeButton = page.getByRole('button', { name: /back to home|wróć do strony głównej/i });
  }

  async goHome(): Promise<void> {
    await this.goHomeButton.click();
  }
}
