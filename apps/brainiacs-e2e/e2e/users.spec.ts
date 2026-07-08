import { expect, test } from '../src/fixtures';
import {
  buildMockUser,
  mockAvatarImage,
  mockCreateUser,
  mockCreateUserError,
  mockDeleteUser,
  mockDeleteUserError,
  mockGetUsers,
  mockGetUsersDelayed,
  mockGetUsersPaginated,
  mockUpdateUser,
  mockUploadAvatar
} from '../src/mocks/users.mock';
import { expectNoA11yViolations } from '../src/utils/axe';

test.describe('Users list', () => {
  test('should display users returned by the API', async ({ page, usersPage }) => {
    const users = [buildMockUser({ id: 1 }), buildMockUser({ id: 2, firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com' })];
    await mockGetUsers(page, users);

    await usersPage.goto();

    await expect(usersPage.spinner).toBeHidden();
    await expect(usersPage.row(1)).toBeVisible();
    await expect(usersPage.row(2)).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test('should show the empty state when there are no users', async ({ page, usersPage }) => {
    await mockGetUsers(page, []);

    await usersPage.goto();

    await expect(usersPage.emptyRow).toBeVisible();
    await expect(usersPage.pagination).toBeHidden();
  });

  test('should show the spinner while the request is in flight', async ({ page, usersPage }) => {
    await mockGetUsersDelayed(page, 1000, { totalPages: 0 });

    await usersPage.goto();

    await expect(usersPage.spinner).toBeVisible();
  });

  test('should navigate between pages and change the page size', async ({ page, usersPage }) => {
    const allUsers = Array.from({ length: 11 }, (_, i) =>
      buildMockUser({ id: i + 1, firstName: `User${i + 1}`, email: `user${i + 1}@example.com` })
    );

    await mockGetUsersPaginated(page, allUsers);

    await usersPage.goto();

    await expect(usersPage.row(1)).toBeVisible();
    await expect(usersPage.row(11)).toBeHidden();

    await usersPage.goToPage(2);

    await expect(usersPage.row(11)).toBeVisible();
    await expect(usersPage.row(1)).toBeHidden();

    await usersPage.setPageSize(25);

    await expect(usersPage.row(1)).toBeVisible();
    await expect(usersPage.row(11)).toBeVisible();
    // All 11 users now fit on a single page of 25 — only page "1" renders, no "2" to page to.
    await expect(usersPage.pagination.getByRole('link', { name: '2' })).toBeHidden();
  });
});

test.describe('Create user', () => {
  test('should create a new user and show it in the list', async ({ page, usersPage, userFormDialog, toast }) => {
    const existingUsers = [buildMockUser({ id: 1 })];
    await mockGetUsers(page, existingUsers);

    await usersPage.goto();
    await usersPage.openAddUserDialog();

    await expectNoA11yViolations(page);

    const createdUser = buildMockUser({ id: 2, firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com' });
    await mockCreateUser(page, createdUser);
    await mockUploadAvatar(page, 2, createdUser);
    await mockGetUsers(page, [...existingUsers, createdUser]);

    await userFormDialog.fill({ firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com' });
    await userFormDialog.uploadAvatar('avatar.png');
    await userFormDialog.submit();

    await expect(usersPage.row(2)).toBeVisible();
    await expect(toast.message).toContainText(/added successfully|dodany pomyślnie/i);
  });

  test('should show a general error when the server rejects the submission', async ({ page, usersPage, userFormDialog }) => {
    await mockGetUsers(page, [buildMockUser({ id: 1 })]);
    await mockCreateUserError(page, { non_field_errors: ['Email already exists'] });

    await usersPage.goto();
    await usersPage.openAddUserDialog();

    await userFormDialog.fill({ firstName: 'Anna', lastName: 'Nowak', email: 'duplicate@example.com' });
    await userFormDialog.uploadAvatar('avatar.png');
    await userFormDialog.submit();

    await expect(userFormDialog.generalError).toContainText(/already exists|istnieje/i);
  });
});

test.describe('Unsaved changes confirmation', () => {
  test('should keep the dialog open when the close confirmation is dismissed', async ({ page, usersPage, userFormDialog }) => {
    await mockGetUsers(page, [buildMockUser({ id: 1 })]);

    await usersPage.goto();
    await usersPage.openAddUserDialog();
    await userFormDialog.firstNameInput.fill('Anna');

    // No dialog listener registered — Playwright auto-dismisses window.confirm() by default,
    // which is exactly the "keep editing" outcome under test here.
    await userFormDialog.cancel();

    await expect(userFormDialog.submitButton).toBeVisible();
  });

  test('should close the dialog when the close confirmation is accepted', async ({ page, usersPage, userFormDialog }) => {
    await mockGetUsers(page, [buildMockUser({ id: 1 })]);

    await usersPage.goto();
    await usersPage.openAddUserDialog();
    await userFormDialog.firstNameInput.fill('Anna');

    const dialogPromise = page.waitForEvent('dialog');
    const cancelPromise = userFormDialog.cancel();
    const dialog = await dialogPromise;

    expect(dialog.message()).toMatch(/unsaved changes|niezapisane zmiany/i);
    await dialog.accept();
    await cancelPromise;

    await expect(userFormDialog.submitButton).toBeHidden();
  });
});

test.describe('Update user', () => {
  test('should update an existing user', async ({ page, usersPage, userFormDialog, toast }) => {
    const existingUser = buildMockUser({ id: 1 });
    await mockGetUsers(page, [existingUser]);
    await mockAvatarImage(page, existingUser.avatar);

    await usersPage.goto();
    await usersPage.openEditUserDialog(1);

    const updatedUser = { ...existingUser, firstName: 'Janusz' };
    await mockUpdateUser(page, 1, updatedUser);
    await mockUploadAvatar(page, 1, updatedUser);
    await mockGetUsers(page, [updatedUser]);

    await userFormDialog.firstNameInput.fill('Janusz');
    await userFormDialog.submit();

    await expect(usersPage.row(1)).toContainText('Janusz');
    await expect(toast.message).toContainText(/updated successfully|zaktualizowany pomyślnie/i);
  });
});

test.describe('Delete user', () => {
  test('should delete a user after confirmation', async ({ page, usersPage, userDeleteConfirmationDialog, toast }) => {
    const existingUser = buildMockUser({ id: 1 });
    await mockGetUsers(page, [existingUser]);

    await usersPage.goto();
    await usersPage.openDeleteDialog(1);

    await expectNoA11yViolations(page);

    await mockDeleteUser(page, 1);
    await mockGetUsers(page, []);

    await expect(userDeleteConfirmationDialog.confirmationMessage).toContainText(existingUser.firstName);
    await userDeleteConfirmationDialog.confirm();

    await expect(usersPage.emptyRow).toBeVisible();
    await expect(toast.message).toContainText(/deleted successfully|usunięty pomyślnie/i);
  });

  test('should not delete the user when cancelling the confirmation dialog', async ({ page, usersPage, userDeleteConfirmationDialog }) => {
    const existingUser = buildMockUser({ id: 1 });
    await mockGetUsers(page, [existingUser]);

    await usersPage.goto();
    await usersPage.openDeleteDialog(1);
    await userDeleteConfirmationDialog.cancel();

    await expect(usersPage.row(1)).toBeVisible();
  });

  test('should not delete the user when closing the dialog via the close button', async ({
    page,
    usersPage,
    userDeleteConfirmationDialog
  }) => {
    const existingUser = buildMockUser({ id: 1 });
    await mockGetUsers(page, [existingUser]);

    await usersPage.goto();
    await usersPage.openDeleteDialog(1);
    await userDeleteConfirmationDialog.closeButton.click();

    await expect(usersPage.row(1)).toBeVisible();
  });

  test('should show a general error when the server rejects the deletion', async ({ page, usersPage, userDeleteConfirmationDialog }) => {
    const existingUser = buildMockUser({ id: 1 });
    await mockGetUsers(page, [existingUser]);
    await mockDeleteUserError(page, 1, { non_field_errors: ['User has active sessions'] });

    await usersPage.goto();
    await usersPage.openDeleteDialog(1);
    await userDeleteConfirmationDialog.confirm();

    await expect(userDeleteConfirmationDialog.generalError).toContainText(/active sessions|aktywne sesje/i);
    await expect(usersPage.row(1)).toBeVisible();
  });
});
