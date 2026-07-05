import { getTranslocoModule } from '@libs/shared/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UserStore } from '../../../../core/store/user/user.store';
import { User } from '../../../../core/types/user.model';
import { UserDeleteConfirmationDialog } from './user-delete-confirmation-dialog';

const mockUser: User = {
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: 'https://example.com/avatar.png'
};

describe('UserDeleteConfirmationDialog', () => {
  let component: UserDeleteConfirmationDialog;
  let fixture: ComponentFixture<UserDeleteConfirmationDialog>;
  let userStoreMock: {
    selectedUser: ReturnType<typeof signal<User | null>>;
    deleteUser: Mock;
    setSelectedUser: Mock;
  };
  let modalMock: { close: Mock; dismiss: Mock };

  beforeEach(async () => {
    userStoreMock = {
      selectedUser: signal<User | null>(mockUser),
      deleteUser: vi.fn(() => of(undefined)),
      setSelectedUser: vi.fn()
    };

    modalMock = {
      close: vi.fn(),
      dismiss: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserDeleteConfirmationDialog, getTranslocoModule()],
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: NgbActiveModal, useValue: modalMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDeleteConfirmationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dismiss on cancel', () => {
    component.cancel();

    expect(modalMock.dismiss).toHaveBeenCalled();
  });

  it('should call deleteUser on the store when deleteUser is triggered', () => {
    component.deleteUser();

    expect(userStoreMock.deleteUser).toHaveBeenCalled();
  });

  it('should set saving to true while the delete request is in flight and false after it completes', () => {
    expect(component.saving()).toBe(false);

    component.deleteUser();

    expect(component.saving()).toBe(false);
  });

  it('should set an error message and keep the dialog open when deletion fails', async () => {
    userStoreMock.deleteUser.mockReturnValue(throwError(() => ({ error: {} })));

    component.deleteUser();
    await fixture.whenStable();

    expect(component.errorMessage()).toBeTruthy();
    expect(modalMock.close).not.toHaveBeenCalled();
  });

  it('should set saving back to false after a failed deletion', async () => {
    userStoreMock.deleteUser.mockReturnValue(throwError(() => ({ error: {} })));

    component.deleteUser();
    await fixture.whenStable();

    expect(component.saving()).toBe(false);
  });

  it('should display the error message alert when errorMessage is set', async () => {
    userStoreMock.deleteUser.mockReturnValue(throwError(() => ({ error: {} })));

    component.deleteUser();
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('.alert-danger');

    expect(alert).toBeTruthy();
  });

  it('should close the dialog when selectedUser becomes null and saving is false', async () => {
    userStoreMock.selectedUser.set(null);
    await fixture.whenStable();

    expect(modalMock.close).toHaveBeenCalled();
  });

  it('should not close the dialog while saving is true, even if selectedUser becomes null', async () => {
    userStoreMock.deleteUser.mockReturnValue(NEVER);
    component.deleteUser();
    userStoreMock.selectedUser.set(null);
    await fixture.whenStable();

    expect(modalMock.close).not.toHaveBeenCalled();
  });

  it('should disable the buttons while saving', async () => {
    userStoreMock.deleteUser.mockReturnValue(NEVER);
    component.deleteUser();
    await fixture.whenStable();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button[disabled]');

    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should not render anything when there is no selected user', async () => {
    userStoreMock.selectedUser.set(null);
    await fixture.whenStable();

    const header = fixture.nativeElement.querySelector('.modal-header');

    expect(header).toBeFalsy();
  });

  it('should clear the selected user on destroy', () => {
    fixture.destroy();

    expect(userStoreMock.setSelectedUser).toHaveBeenCalledWith(null);
  });
});
