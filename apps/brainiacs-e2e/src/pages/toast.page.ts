import { Locator, Page } from '@playwright/test';

export class ToastPage {
  readonly container: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.container = page.locator('#toast-container');
    this.message = this.container.getByRole('alert');
  }
}
