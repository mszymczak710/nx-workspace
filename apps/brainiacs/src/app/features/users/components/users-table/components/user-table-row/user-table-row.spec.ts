import { getTranslocoModule } from '@libs/shared/core/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../../../../../core/types/user.model';
import { UserTableRow } from './user-table-row';

const mockUser: User = {
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  avatar: 'https://example.com/avatar.png'
};

describe('UserTableRow', () => {
  let component: UserTableRow;
  let fixture: ComponentFixture<UserTableRow>;

  const getUpdateButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button:has(.fa-edit)');
  const getDeleteButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button:has(.fa-trash-alt)');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTableRow, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserTableRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render user data', () => {
    const cells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('td');
    const avatar: HTMLImageElement = fixture.nativeElement.querySelector('.avatar');

    expect(cells[0].textContent?.trim()).toBe(String(mockUser.id));
    expect(avatar.src).toBe(mockUser.avatar);
    expect(avatar.alt).toBe(`${mockUser.firstName} ${mockUser.lastName}`);
    expect(fixture.nativeElement.textContent).toContain(mockUser.firstName);
    expect(fixture.nativeElement.textContent).toContain(mockUser.lastName);
    expect(fixture.nativeElement.textContent).toContain(mockUser.email);
  });

  it('should emit updateUser on update button click', () => {
    const updateSpy = vi.spyOn(component.updateUser, 'emit');

    getUpdateButton().click();

    expect(updateSpy).toHaveBeenCalled();
  });

  it('should emit deleteUser on delete button click', () => {
    const deleteSpy = vi.spyOn(component.deleteUser, 'emit');

    getDeleteButton().click();

    expect(deleteSpy).toHaveBeenCalled();
  });
});
