import { expect, test } from '../src/fixtures';
import { buildMockUser, mockGetUsers } from '../src/mocks/users.mock';

test.describe('User form validation', () => {
  test.beforeEach(async ({ page, usersPage }) => {
    await mockGetUsers(page, [buildMockUser({ id: 1 })]);
    await usersPage.goto();
    await usersPage.openAddUserDialog();
  });

  test('should show a required error when the first name is left empty', async ({ userFormDialog }) => {
    await userFormDialog.firstNameInput.fill('');
    await userFormDialog.firstNameInput.blur();

    await expect(userFormDialog.fieldError('firstName')).toContainText(/required|wymagane/i);
  });

  test('should show a required error when the last name is left empty', async ({ userFormDialog }) => {
    await userFormDialog.lastNameInput.fill('');
    await userFormDialog.lastNameInput.blur();

    await expect(userFormDialog.fieldError('lastName')).toContainText(/required|wymagane/i);
  });

  test('should show a required error when the email is left empty', async ({ userFormDialog }) => {
    await userFormDialog.emailInput.fill('');
    await userFormDialog.emailInput.blur();

    await expect(userFormDialog.fieldError('email')).toContainText(/required|wymagane/i);
  });

  test('should show a pattern error and keep the submit button disabled for an invalid first name format', async ({ userFormDialog }) => {
    await userFormDialog.firstNameInput.fill('anna');
    await userFormDialog.firstNameInput.blur();

    await expect(userFormDialog.fieldError('firstName')).toContainText(/invalid first name|niepoprawne imię/i);
    await expect(userFormDialog.submitButton).toBeDisabled();
  });

  test('should show a pattern error for an invalid last name format', async ({ userFormDialog }) => {
    await userFormDialog.lastNameInput.fill('nowak');
    await userFormDialog.lastNameInput.blur();

    await expect(userFormDialog.fieldError('lastName')).toContainText(/invalid last name|niepoprawne nazwisko/i);
  });

  test('should show a format error for an invalid email address', async ({ userFormDialog }) => {
    await userFormDialog.emailInput.fill('not-an-email');
    await userFormDialog.emailInput.blur();

    await expect(userFormDialog.fieldError('email')).toContainText(/invalid email|niepoprawny adres/i);
  });

  test('should cap the first name length via the native maxlength constraint', async ({ userFormDialog }) => {
    await expect(userFormDialog.firstNameInput).toHaveAttribute('maxlength', '255');

    await userFormDialog.firstNameInput.fill(`A${'a'.repeat(300)}`);

    const value = await userFormDialog.firstNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(255);
  });

  test('should show a required error and keep the submit button disabled when no avatar is selected', async ({ userFormDialog }) => {
    await userFormDialog.avatarInput.focus();
    await userFormDialog.avatarInput.blur();

    await expect(userFormDialog.avatarRequiredError).toContainText(/required|wymagane/i);
    await expect(userFormDialog.submitButton).toBeDisabled();
  });

  test('should show a square-image error and keep the submit button disabled for a non-square avatar', async ({ userFormDialog }) => {
    await userFormDialog.uploadAvatar('avatar-non-square.png');

    await expect(userFormDialog.avatarSizeError).toContainText(/must be equal to its height|musi być równa jego wysokości/i);
    await expect(userFormDialog.submitButton).toBeDisabled();
  });
});
