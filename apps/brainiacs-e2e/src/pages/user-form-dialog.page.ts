import { Locator, Page } from '@playwright/test';
import { fixturePath } from '../utils/fixture-path';

export class UserFormDialogPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly avatarInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly generalError: Locator;
  readonly avatarRequiredError: Locator;
  readonly avatarSizeError: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByLabel(/first name|imię/i);
    this.lastNameInput = page.getByLabel(/last name|nazwisko/i);
    this.emailInput = page.getByLabel(/email address|adres e-mail/i);
    this.avatarInput = page.getByLabel(/avatar|awatar/i);
    this.submitButton = page.getByRole('button', { name: /save|zapisz/i });
    this.cancelButton = page.getByRole('button', { name: /cancel|anuluj/i });
    this.closeButton = page.getByRole('button', { name: /close|zamknij/i });
    // These elements carry `role="alert"`, but several of them can be visible simultaneously
    // (e.g. multiple invalid fields at once) with no distinguishing accessible name beyond the
    // message text itself — `getByRole('alert')` would be ambiguous, and matching by name would be
    // circular with what the tests assert. Documented exception, same class as `disabledHelpLink`
    // in navbar.page.ts.
    this.generalError = page.getByTestId('form-general-error');
    this.avatarRequiredError = page.locator('#avatar-required-error');
    this.avatarSizeError = page.locator('#avatar-size-error');
  }

  // See the constructor comment above — same "multiple simultaneous `role=alert` elements"
  // rationale for using an id selector instead of `getByRole('alert')`.
  fieldError(fieldName: string): Locator {
    return this.page.locator(`#${fieldName}-error`);
  }

  async fill(data: { firstName: string; lastName: string; email: string }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
  }

  async uploadAvatar(fileName: string): Promise<void> {
    const filePath = fixturePath(fileName);
    await this.avatarInput.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
