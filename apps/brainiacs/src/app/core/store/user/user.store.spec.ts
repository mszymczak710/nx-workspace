import { TranslocoService } from '@jsverse/transloco';
import { ToastService } from '@libs/shared/core/services';

import { TestBed } from '@angular/core/testing';

import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UserService } from '../../services/user/user.service';
import { ListResponse } from '../../types/list-response.model';
import { User, UserSaveData } from '../../types/user.model';
import { UserStore } from './user.store';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: 'https://example.com/avatar.png',
  ...overrides
});

const buildListResponse = (overrides: Partial<ListResponse<User>> = {}): ListResponse<User> => ({
  content: [buildUser()],
  currentPage: 1,
  totalElements: 1,
  totalPages: 1,
  pageSize: 10,
  ...overrides
});

const userData: UserSaveData = { firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com' };

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let userServiceMock: {
    getUsers: Mock;
    addUser: Mock;
    updateUser: Mock;
    deleteUser: Mock;
    uploadAvatar: Mock;
  };
  let toastServiceMock: { showSuccessMessage: Mock };
  let translocoServiceMock: { translate: Mock };

  beforeEach(() => {
    userServiceMock = {
      getUsers: vi.fn(() => of(buildListResponse())),
      addUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(() => of(undefined)),
      uploadAvatar: vi.fn()
    };

    toastServiceMock = { showSuccessMessage: vi.fn() };
    translocoServiceMock = { translate: vi.fn((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: TranslocoService, useValue: translocoServiceMock }
      ]
    });

    store = TestBed.inject(UserStore);
  });

  it('should have the correct initial state', () => {
    expect(store.currentPage()).toBe(1);
    expect(store.totalElements()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.pageSize()).toBe(10);
    expect(store.loading()).toBe(false);
    expect(store.selectedUser()).toBeNull();
    expect(store.entities()).toEqual([]);
  });

  it('should set the selected user', () => {
    const user = buildUser();

    store.setSelectedUser(user);

    expect(store.selectedUser()).toEqual(user);
  });

  it('should clear the selected user when passed null', () => {
    store.setSelectedUser(buildUser());
    store.setSelectedUser(null);

    expect(store.selectedUser()).toBeNull();
  });

  it('should populate entities and pagination state on success', () => {
    const response = buildListResponse({
      content: [buildUser({ id: 1 }), buildUser({ id: 2 })],
      totalElements: 2,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(response));

    store.loadUsers({ page: 1, pageSize: 10 });

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    expect(store.entities().length).toBe(2);
    expect(store.totalElements()).toBe(2);
    expect(store.totalPages()).toBe(1);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(10);
    expect(store.loading()).toBe(false);
  });

  it('should use the current page and page size from state when called without arguments', () => {
    userServiceMock.getUsers.mockReturnValueOnce(of(buildListResponse({ currentPage: 3, pageSize: 20 })));
    store.loadUsers({ page: 3, pageSize: 20 });
    userServiceMock.getUsers.mockClear();

    store.loadUsers();

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 3, pageSize: 20 });
  });

  it('should set loading to false after a failed request without throwing', () => {
    userServiceMock.getUsers.mockReturnValue(throwError(() => new Error('network error')));

    expect(() => store.loadUsers({ page: 1, pageSize: 10 })).not.toThrow();
    expect(store.loading()).toBe(false);
    expect(store.entities()).toEqual([]);
  });

  it('should reload users starting from page 1 with the new page size', () => {
    store.changePageSize(25);

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 25 });
  });

  it('should create a user without uploading an avatar when none is provided', () => {
    const createdUser = buildUser({ id: 10, ...userData });
    userServiceMock.addUser.mockReturnValue(of(createdUser));

    let result: User | undefined;
    store.addUser(userData, null).subscribe(user => (result = user));

    expect(userServiceMock.addUser).toHaveBeenCalledWith(userData);
    expect(userServiceMock.uploadAvatar).not.toHaveBeenCalled();
    expect(result).toEqual(createdUser);
  });

  it('should upload the avatar after creating the user when one is provided', () => {
    const createdUser = buildUser({ id: 10, ...userData });
    const avatarFile = new File([''], 'avatar.png', { type: 'image/png' });
    const userWithAvatar = { ...createdUser, avatar: 'https://example.com/new-avatar.png' };

    userServiceMock.addUser.mockReturnValue(of(createdUser));
    userServiceMock.uploadAvatar.mockReturnValue(of(userWithAvatar));

    let result: User | undefined;
    store.addUser(userData, avatarFile).subscribe(user => (result = user));

    expect(userServiceMock.uploadAvatar).toHaveBeenCalledWith(createdUser.id, avatarFile);
    expect(result).toEqual(userWithAvatar);
  });

  it('should refresh the list and show a success toast after creating a user', () => {
    const createdUser = buildUser({ id: 10, ...userData });
    userServiceMock.addUser.mockReturnValue(of(createdUser));
    userServiceMock.getUsers.mockClear();

    store.addUser(userData, null).subscribe();

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: store.currentPage(), pageSize: store.pageSize() });
    expect(translocoServiceMock.translate).toHaveBeenCalledWith('users.toast.createSuccess');
    expect(toastServiceMock.showSuccessMessage).toHaveBeenCalledWith('users.toast.createSuccess');
  });

  it('should throw an error when no user is selected during update', () => {
    let caughtError: unknown;

    store.updateUser(userData, null).subscribe({ error: err => (caughtError = err) });

    expect(caughtError).toBeInstanceOf(Error);
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it('should update the selected user and refresh the list', () => {
    const selected = buildUser({ id: 5 });
    const updated = { ...selected, ...userData };

    store.setSelectedUser(selected);
    userServiceMock.updateUser.mockReturnValue(of(updated));
    userServiceMock.getUsers.mockClear();

    let result: User | undefined;
    store.updateUser(userData, null).subscribe(user => (result = user));

    expect(userServiceMock.updateUser).toHaveBeenCalledWith(selected.id, userData);
    expect(result).toEqual(updated);
    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: store.currentPage(), pageSize: store.pageSize() });
    expect(translocoServiceMock.translate).toHaveBeenCalledWith('users.toast.updateSuccess');
    expect(toastServiceMock.showSuccessMessage).toHaveBeenCalledWith('users.toast.updateSuccess');
  });

  it('should upload a new avatar when provided during update', () => {
    const selected = buildUser({ id: 5 });
    const updated = { ...selected, ...userData };
    const avatarFile = new File([''], 'avatar.png', { type: 'image/png' });
    const userWithAvatar = { ...updated, avatar: 'https://example.com/updated-avatar.png' };

    store.setSelectedUser(selected);
    userServiceMock.updateUser.mockReturnValue(of(updated));
    userServiceMock.uploadAvatar.mockReturnValue(of(userWithAvatar));

    let result: User | undefined;
    store.updateUser(userData, avatarFile).subscribe(user => (result = user));

    expect(userServiceMock.uploadAvatar).toHaveBeenCalledWith(updated.id, avatarFile);
    expect(result).toEqual(userWithAvatar);
  });

  it('should throw an error when no user is selected during deletion', () => {
    let caughtError: unknown;

    store.deleteUser().subscribe({ error: err => (caughtError = err) });

    expect(caughtError).toBeInstanceOf(Error);
    expect(userServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  it('should remove the entity, clear the selection and show a success toast', () => {
    const initialResponse = buildListResponse({
      content: [buildUser({ id: 1 }), buildUser({ id: 2 })],
      totalElements: 2,
      currentPage: 1,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(initialResponse));
    store.loadUsers({ page: 1, pageSize: 10 });

    const selected = buildUser({ id: 1 });
    store.setSelectedUser(selected);

    const responseAfterDeletion = buildListResponse({
      content: [buildUser({ id: 2 })],
      totalElements: 1,
      currentPage: 1,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(responseAfterDeletion));
    userServiceMock.getUsers.mockClear();

    store.deleteUser().subscribe();

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(selected.id);
    expect(store.entities().some(user => user.id === selected.id)).toBe(false);
    expect(store.selectedUser()).toBeNull();
    expect(translocoServiceMock.translate).toHaveBeenCalledWith('users.toast.deleteSuccess');
    expect(toastServiceMock.showSuccessMessage).toHaveBeenCalledWith('users.toast.deleteSuccess');
  });

  it('should stay on the same page when items remain after deletion', () => {
    const response = buildListResponse({
      content: [buildUser({ id: 1 }), buildUser({ id: 2 })],
      totalElements: 2,
      currentPage: 2,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(response));
    store.loadUsers({ page: 2, pageSize: 10 });

    store.setSelectedUser(buildUser({ id: 1 }));
    userServiceMock.getUsers.mockClear();

    store.deleteUser().subscribe();

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });

  it('should go back one page when deleting the last remaining item on a page beyond the first', () => {
    const response = buildListResponse({
      content: [buildUser({ id: 1 })],
      totalElements: 11,
      currentPage: 2,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(response));
    store.loadUsers({ page: 2, pageSize: 10 });

    store.setSelectedUser(buildUser({ id: 1 }));
    userServiceMock.getUsers.mockClear();

    store.deleteUser().subscribe();

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('should stay on first page when deleting the last remaining item while already on first page', () => {
    const response = buildListResponse({
      content: [buildUser({ id: 1 })],
      totalElements: 1,
      currentPage: 1,
      pageSize: 10
    });
    userServiceMock.getUsers.mockReturnValue(of(response));
    store.loadUsers({ page: 1, pageSize: 10 });

    store.setSelectedUser(buildUser({ id: 1 }));
    userServiceMock.getUsers.mockClear();

    store.deleteUser().subscribe();

    expect(userServiceMock.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });
});
