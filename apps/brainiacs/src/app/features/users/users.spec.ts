import { getTranslocoModule } from '@libs/shared/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UserStore } from '../../core/store/user/user.store';
import { UserFormDialog } from './components/user-form-dialog/user-form-dialog';
import { UsersTable } from './components/users-table/users-table';
import { Users } from './users';

@Component({
  selector: 'brn-users-table',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class UsersTableStub {}

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let modalMock: { open: Mock };
  let loadingSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    loadingSignal = signal(false);
    modalMock = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Users, getTranslocoModule()],
      providers: [
        { provide: NgbModal, useValue: modalMock },
        { provide: UserStore, useValue: { loading: loadingSignal } }
      ]
    })
      .overrideComponent(Users, {
        remove: { imports: [UsersTable] },
        add: { imports: [UsersTableStub] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open UserFormDialog with correct options on addUser()', () => {
    component.addUser();

    expect(modalMock.open).toHaveBeenCalledWith(UserFormDialog, {
      size: 'md',
      backdrop: 'static'
    });
  });

  it('should call addUser() when button is clicked', () => {
    const addUserSpy = vi.spyOn(component, 'addUser');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(addUserSpy).toHaveBeenCalled();
  });

  it('should disable the button when loading is true', async () => {
    loadingSignal.set(true);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('should enable the button when loading is false', async () => {
    loadingSignal.set(false);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(false);
  });
});
