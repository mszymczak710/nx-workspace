import { HttpMethod } from '@libs/shared/core/types';
import { Page } from '@playwright/test';
import { fixturePath } from '../utils/fixture-path';

export interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

export const buildMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: 'https://example.com/avatar.png',
  ...overrides
});

export const buildListResponse = (users: MockUser[], overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  content: users,
  currentPage: 1,
  totalElements: users.length,
  totalPages: 1,
  pageSize: 10,
  ...overrides
});

export const mockGetUsers = async (page: Page, users: MockUser[], overrides: Record<string, unknown> = {}): Promise<void> => {
  await page.route('**/api/users?**', route => {
    if (route.request().method() !== HttpMethod.Get) {
      route.continue();
      return;
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildListResponse(users, overrides))
    });
  });
};

export const mockGetUsersDelayed = async (page: Page, delayMs: number, overrides: Record<string, unknown> = {}): Promise<void> => {
  await page.route('**/api/users?**', async route => {
    if (route.request().method() !== HttpMethod.Get) {
      route.continue();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildListResponse([], overrides))
    });
  });
};

export const mockGetUsersPaginated = async (page: Page, allUsers: MockUser[]): Promise<void> => {
  await page.route('**/api/users?**', route => {
    if (route.request().method() !== HttpMethod.Get) {
      route.continue();
      return;
    }
    const url = new URL(route.request().url());
    const currentPage = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const start = (currentPage - 1) * pageSize;
    const content = allUsers.slice(start, start + pageSize);

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        buildListResponse(content, {
          currentPage,
          pageSize,
          totalElements: allUsers.length,
          totalPages: Math.ceil(allUsers.length / pageSize)
        })
      )
    });
  });
};

export const mockCreateUser = async (page: Page, createdUser: MockUser): Promise<void> => {
  await page.route('**/api/users', route => {
    if (route.request().method() !== HttpMethod.Post) {
      route.continue();
      return;
    }
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(createdUser)
    });
  });
};

export const mockCreateUserError = async (page: Page, body: Record<string, unknown>, status = 400): Promise<void> => {
  await page.route('**/api/users', route => {
    if (route.request().method() !== HttpMethod.Post) {
      route.continue();
      return;
    }
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
};

export const mockUploadAvatar = async (page: Page, userId: number, updatedUser: MockUser): Promise<void> => {
  await page.route(`**/api/users/${userId}/avatar`, route => {
    if (route.request().method() !== HttpMethod.Put) {
      route.continue();
      return;
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(updatedUser)
    });
  });
};

export const mockUpdateUser = async (page: Page, userId: number, updatedUser: MockUser): Promise<void> => {
  await page.route(`**/api/users/${userId}`, route => {
    if (route.request().method() !== HttpMethod.Put) {
      route.continue();
      return;
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(updatedUser)
    });
  });
};

export const mockDeleteUser = async (page: Page, userId: number): Promise<void> => {
  await page.route(`**/api/users/${userId}`, route => {
    if (route.request().method() !== HttpMethod.Delete) {
      route.continue();
      return;
    }
    route.fulfill({ status: 204 });
  });
};

export const mockDeleteUserError = async (page: Page, userId: number, body: Record<string, unknown>, status = 400): Promise<void> => {
  await page.route(`**/api/users/${userId}`, route => {
    if (route.request().method() !== HttpMethod.Delete) {
      route.continue();
      return;
    }
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
};

export const mockAvatarImage = async (page: Page, avatarUrl: string): Promise<void> => {
  await page.route(avatarUrl, route => {
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      path: fixturePath('avatar.png')
    });
  });
};
