import { getTranslocoModule } from '@libs/shared/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UserStore } from '../../../../core/store/user/user.store';
import { User } from '../../../../core/types/user.model';
import { UserDeleteConfirmationDialog } from '../user-delete-confirmation-dialog/user-delete-confirmation-dialog';
import { UserFormDialog } from '../user-form-dialog/user-form-dialog';
import { UsersTable } from './users-table';

const mockUsers: User[] = [
  { id: 1, firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', avatar: '' },
  { id: 2, firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com', avatar: '' }
];

describe('UsersTable', () => {
  let component: UsersTable;
  let fixture: ComponentFixture<UsersTable>;
  let userStoreMock: {
    entities: ReturnType<typeof signal<User[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    currentPage: ReturnType<typeof signal<number>>;
    totalPages: ReturnType<typeof signal<number>>;
    totalElements: ReturnType<typeof signal<number>>;
    pageSize: ReturnType<typeof signal<number>>;
    loadUsers: Mock;
    setSelectedUser: Mock;
    changePageSize: Mock;
  };
  let modalMock: { open: Mock };

  beforeEach(async () => {
    userStoreMock = {
      entities: signal<User[]>([]),
      loading: signal(false),
      currentPage: signal(1),
      totalPages: signal(1),
      totalElements: signal(0),
      pageSize: signal(10),
      loadUsers: vi.fn(),
      setSelectedUser: vi.fn(),
      changePageSize: vi.fn()
    };

    modalMock = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UsersTable, getTranslocoModule()],
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: NgbModal, useValue: modalMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUsers with the current page and page size on init', () => {
    expect(userStoreMock.loadUsers).toHaveBeenCalled();
  });

  it('should show the spinner and hide the table while loading', async () => {
    userStoreMock.loading.set(true);
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('brn-spinner');
    const table = fixture.nativeElement.querySelector('table');

    expect(spinner).toBeTruthy();
    expect(table).toBeFalsy();
  });

  it('should show the table when not loading', async () => {
    userStoreMock.loading.set(false);
    await fixture.whenStable();

    const table = fixture.nativeElement.querySelector('table');
    const spinner = fixture.nativeElement.querySelector('brn-spinner');

    expect(table).toBeTruthy();
    expect(spinner).toBeFalsy();
  });

  it('should show the empty row and no pagination when there are no users', async () => {
    userStoreMock.entities.set([]);
    await fixture.whenStable();

    const emptyRow = fixture.nativeElement.querySelector('.empty-row');
    const pagination = fixture.nativeElement.querySelector('brn-user-table-pagination');

    expect(emptyRow).toBeTruthy();
    expect(pagination).toBeFalsy();
  });

  it('should render a row per user and show pagination when users exist', async () => {
    userStoreMock.entities.set(mockUsers);
    userStoreMock.totalElements.set(mockUsers.length);
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('[brn-user-table-row]');
    const pagination = fixture.nativeElement.querySelector('brn-user-table-pagination');
    const emptyRow = fixture.nativeElement.querySelector('.empty-row');

    expect(rows).toHaveLength(mockUsers.length);
    expect(pagination).toBeTruthy();
    expect(emptyRow).toBeFalsy();
  });

  it('should call setSelectedUser and open the delete confirmation dialog on deleteUser', () => {
    const user = mockUsers[0];

    component.deleteUser(user);

    expect(userStoreMock.setSelectedUser).toHaveBeenCalledWith(user);
    expect(modalMock.open).toHaveBeenCalledWith(UserDeleteConfirmationDialog, { size: 'md', backdrop: 'static' });
  });

  it('should call setSelectedUser and open the form dialog on updateUser', () => {
    const user = mockUsers[0];

    component.updateUser(user);

    expect(userStoreMock.setSelectedUser).toHaveBeenCalledWith(user);
    expect(modalMock.open).toHaveBeenCalledWith(UserFormDialog, expect.objectContaining({ size: 'md', backdrop: 'static' }));
  });

  it('should call changePageSize on the store when the page size changes', () => {
    component.onPageSizeChange(25);

    expect(userStoreMock.changePageSize).toHaveBeenCalledWith(25);
  });

  it('should call loadUsers with the requested page and current page size when the page changes', () => {
    userStoreMock.loadUsers.mockClear();

    component.onPageChange(3);

    expect(userStoreMock.loadUsers).toHaveBeenCalledWith({ page: 3, pageSize: userStoreMock.pageSize() });
  });
});
