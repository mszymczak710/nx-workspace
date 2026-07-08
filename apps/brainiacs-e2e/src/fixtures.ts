import { test as base } from '@playwright/test';

import { HomePage } from './pages/home.page';
import { NavbarPage } from './pages/navbar.page';
import { NotFoundPage } from './pages/not-found.page';
import { ToastPage } from './pages/toast.page';
import { UserDeleteConfirmationDialogPage } from './pages/user-delete-confirmation-dialog.page';
import { UserFormDialogPage } from './pages/user-form-dialog.page';
import { UsersPage } from './pages/users.page';

interface Fixtures {
  homePage: HomePage;
  navbarPage: NavbarPage;
  notFoundPage: NotFoundPage;
  usersPage: UsersPage;
  userFormDialog: UserFormDialogPage;
  userDeleteConfirmationDialog: UserDeleteConfirmationDialogPage;
  toast: ToastPage;
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  navbarPage: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
  notFoundPage: async ({ page }, use) => {
    await use(new NotFoundPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  userFormDialog: async ({ page }, use) => {
    await use(new UserFormDialogPage(page));
  },
  userDeleteConfirmationDialog: async ({ page }, use) => {
    await use(new UserDeleteConfirmationDialogPage(page));
  },
  toast: async ({ page }, use) => {
    await use(new ToastPage(page));
  }
});

export { expect } from '@playwright/test';
