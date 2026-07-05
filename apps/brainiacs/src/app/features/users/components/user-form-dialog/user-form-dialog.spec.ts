import { getTranslocoModule } from '@libs/shared/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, Mock, MockInstance, vi } from 'vitest';

import { UserStore } from '../../../../core/store/user/user.store';
import { User } from '../../../../core/types/user.model';
import { UserFormDialog } from './user-form-dialog';

const mockUser: User = {
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: 'https://example.com/avatar.png'
};

const setInputValue = (input: HTMLInputElement, value: string): void => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

const createSquareFile = (): File => new File(['x'], 'avatar.png', { type: 'image/png' });

const createFileList = (files: File[]): FileList => {
  const fileList: Record<number | string, unknown> = {
    length: files.length,
    item: (index: number) => files[index] ?? null,
    [Symbol.iterator]: () => files[Symbol.iterator]()
  };

  files.forEach((file, index) => {
    fileList[index] = file;
  });

  return fileList as unknown as FileList;
};

const stubImageDimensions = (width: number, height: number): void => {
  vi.stubGlobal(
    'Image',
    class {
      width = width;
      height = height;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
  );
};

describe('UserFormDialog', () => {
  let component: UserFormDialog;
  let fixture: ComponentFixture<UserFormDialog>;
  let httpMock: HttpTestingController;
  let userStoreMock: {
    selectedUser: ReturnType<typeof signal<User | null>>;
    addUser: Mock;
    updateUser: Mock;
    setSelectedUser: Mock;
  };
  let modalMock: { close: Mock; dismiss: Mock };
  let confirmSpy: MockInstance<typeof window.confirm>;

  const setup = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [UserFormDialog, getTranslocoModule()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserStore, useValue: userStoreMock },
        { provide: NgbActiveModal, useValue: modalMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialog);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    await fixture.whenStable();
  };

  const fillValidFormFields = async (): Promise<void> => {
    const firstName: HTMLInputElement = fixture.nativeElement.querySelector('#firstName');
    const lastName: HTMLInputElement = fixture.nativeElement.querySelector('#lastName');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('#email');

    setInputValue(firstName, 'Anna');
    setInputValue(lastName, 'Nowak');
    setInputValue(email, 'anna.nowak@example.com');

    await fixture.whenStable();
  };

  const selectAvatarFile = async (width: number, height: number): Promise<void> => {
    const fileInput: HTMLInputElement = fixture.nativeElement.querySelector('#avatar');
    const file = createSquareFile();

    stubImageDimensions(width, height);
    Object.defineProperty(fileInput, 'files', { value: createFileList([file]), configurable: true });

    fileInput.dispatchEvent(new Event('change'));

    await fixture.whenStable();
  };

  const submitForm = async (): Promise<void> => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('#userForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await fixture.whenStable();
  };

  const flushAvatarRequest = async (): Promise<void> => {
    const req = httpMock.expectOne(mockUser.avatar);
    req.flush(new Blob(['avatar-bytes'], { type: 'image/png' }));

    await fixture.whenStable();
  };

  beforeEach(() => {
    confirmSpy = vi.spyOn(window, 'confirm');

    userStoreMock = {
      selectedUser: signal<User | null>(null),
      addUser: vi.fn(),
      updateUser: vi.fn(),
      setSelectedUser: vi.fn()
    };

    modalMock = {
      close: vi.fn(),
      dismiss: vi.fn()
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    httpMock.verify();
  });

  it('should create in "create" mode when there is no selected user', async () => {
    await setup();

    expect(component).toBeTruthy();
    expect(component.isUpdate()).toBe(false);
  });

  it('should create in "update" mode when a user is selected', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();
    await flushAvatarRequest();

    expect(component.isUpdate()).toBe(true);
  });

  it('should fill the form fields with the selected user data in update mode', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();
    await flushAvatarRequest();

    const firstName: HTMLInputElement = fixture.nativeElement.querySelector('#firstName');
    const lastName: HTMLInputElement = fixture.nativeElement.querySelector('#lastName');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('#email');

    expect(firstName.value).toBe(mockUser.firstName);
    expect(lastName.value).toBe(mockUser.lastName);
    expect(email.value).toBe(mockUser.email);
  });

  it('should be true immediately when editing a user with an existing avatar', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();

    expect(component.avatarLoading()).toBe(true);

    await flushAvatarRequest();
  });

  it('should fetch the existing avatar over HttpClient when editing a user that has one', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();

    const req = httpMock.expectOne(mockUser.avatar);
    expect(req.request.method).toBe('GET');

    req.flush(new Blob(['avatar-bytes'], { type: 'image/png' }));
    await fixture.whenStable();

    expect(component.avatarFile()).toBeTruthy();
    expect(component.avatarPreview()).toBe(mockUser.avatar);
    expect(component.avatarLoading()).toBe(false);
  });

  it('should reset avatarLoading and leave the avatar empty when the avatar request fails', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();

    const req = httpMock.expectOne(mockUser.avatar);
    req.flush(new Blob(['not found'], { type: 'text/plain' }), { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(component.avatarLoading()).toBe(false);
    expect(component.avatarFile()).toBeNull();
  });

  it('should not attempt to fetch an avatar when creating a new user', async () => {
    await setup();

    expect(component.avatarLoading()).toBe(false);
    httpMock.expectNone(() => true);
  });

  it('should call cancel and dismiss the modal', async () => {
    await setup();

    component.cancel();

    expect(modalMock.dismiss).toHaveBeenCalled();
  });

  it('should clear the selected user on destroy', async () => {
    await setup();

    fixture.destroy();

    expect(userStoreMock.setSelectedUser).toHaveBeenCalledWith(null);
  });

  it('should mark the avatar as invalid and clear it when a non-square image is selected', async () => {
    await setup();
    await selectAvatarFile(100, 50);

    expect(component.avatarSizeInvalid()).toBe(true);
    expect(component.avatarFile()).toBeNull();
    expect(component.avatarInvalid()).toBe(true);
  });

  it('should accept a square image and mark the avatar as valid', async () => {
    await setup();
    await selectAvatarFile(100, 100);

    expect(component.avatarSizeInvalid()).toBe(false);
    expect(component.avatarFile()).toBeTruthy();
    expect(component.avatarInvalid()).toBe(false);
    expect(component.avatarPreview()).toBeTruthy();
  });

  it('should disable the submit button while the avatar is invalid', async () => {
    await setup();
    await fillValidFormFields();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBe(true);
  });

  it('should disable the file input and the submit button while the avatar is still loading', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();
    await fillValidFormFields();

    const fileInput: HTMLInputElement = fixture.nativeElement.querySelector('#avatar');
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(fileInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);

    await flushAvatarRequest();

    expect(fileInput.disabled).toBe(false);
    expect(submitButton.disabled).toBe(false);
  });

  it('should show the spinner while loading and the avatar preview once loading completes', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();

    expect(fixture.nativeElement.querySelector('brn-spinner')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.avatar-preview')).toBeFalsy();

    await flushAvatarRequest();

    expect(fixture.nativeElement.querySelector('.avatar-preview')).toBeTruthy();
  });

  it('should not show the required validation message while the avatar is still loading', async () => {
    userStoreMock.selectedUser.set(mockUser);
    await setup();

    const fileInput: HTMLInputElement = fixture.nativeElement.querySelector('#avatar');
    fileInput.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('.text-danger[role="alert"]');
    expect(alert).toBeFalsy();

    await flushAvatarRequest();
  });

  it('should show a general error and not submit when the avatar is missing on submission', async () => {
    await setup();
    await fillValidFormFields();
    await submitForm();

    expect(userStoreMock.addUser).not.toHaveBeenCalled();

    const alert: HTMLElement | null = fixture.nativeElement.querySelector('.alert-danger');
    expect(alert).toBeTruthy();
  });

  it('should call userStore.addUser and close the modal on successful creation', async () => {
    userStoreMock.addUser.mockReturnValue(of(mockUser));

    await setup();
    await fillValidFormFields();
    await selectAvatarFile(100, 100);
    await submitForm();

    expect(userStoreMock.addUser).toHaveBeenCalledWith(
      { firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com' },
      // eslint-disable-next-line vitest/valid-expect
      expect.any(File)
    );
    expect(modalMock.close).toHaveBeenCalled();
  });

  it('should call userStore.updateUser and close the modal on successful update', async () => {
    userStoreMock.selectedUser.set(mockUser);
    userStoreMock.updateUser.mockReturnValue(of(mockUser));

    await setup();
    await flushAvatarRequest();

    await fillValidFormFields();
    await submitForm();

    expect(userStoreMock.updateUser).toHaveBeenCalledWith(
      { firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com' },
      // eslint-disable-next-line vitest/valid-expect
      expect.any(File)
    );
    expect(modalMock.close).toHaveBeenCalled();
  });

  it('should hasUnsavedChanges be false initially and true after a field changes', async () => {
    await setup();
    expect(component.hasUnsavedChanges()).toBe(false);

    await fillValidFormFields();
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('should return true without asking when there are no unsaved changes', async () => {
    await setup();

    expect(component.canDismiss()).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('should ask for confirmation and return true when the user confirms', async () => {
    await setup();
    await fillValidFormFields();

    confirmSpy.mockReturnValue(true);

    expect(component.canDismiss()).toBe(true);
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should ask for confirmation and return false when the user cancels (canDismiss)', async () => {
    await setup();
    await fillValidFormFields();

    confirmSpy.mockReturnValue(false);

    expect(component.canDismiss()).toBe(false);
    expect(confirmSpy).toHaveBeenCalled();
  });
});
