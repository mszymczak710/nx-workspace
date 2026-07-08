import { Locator, Page } from '@playwright/test';

export class UserDeleteConfirmationDialogPage {
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly confirmationMessage: Locator;
  readonly generalError: Locator;

  constructor(page: Page) {
    this.confirmButton = page.getByRole('button', { name: /delete|usuń/i });
    this.cancelButton = page.getByRole('button', { name: /cancel|anuluj/i });
    this.closeButton = page.getByRole('button', { name: /close|zamknij/i });
    this.confirmationMessage = page.getByTestId('delete-confirmation-message');
    this.generalError = page.getByTestId('delete-general-error');
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
