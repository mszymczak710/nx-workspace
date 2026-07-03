import { getTranslocoModule } from '@libs/shared/core/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserTablePagination } from './user-table-pagination';

describe('UserTablePagination', () => {
  let component: UserTablePagination;
  let fixture: ComponentFixture<UserTablePagination>;

  const setInputs = (
    overrides: Partial<{ page: number; pageSize: number; collectionSize: number; pageSizeOptions: number[] }> = {}
  ): void => {
    fixture.componentRef.setInput('page', overrides.page ?? 1);
    fixture.componentRef.setInput('pageSize', overrides.pageSize ?? 10);
    fixture.componentRef.setInput('collectionSize', overrides.collectionSize ?? 100);

    if (overrides.pageSizeOptions) {
      fixture.componentRef.setInput('pageSizeOptions', overrides.pageSizeOptions);
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTablePagination, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserTablePagination);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    setInputs();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('should render default page size options', async () => {
    setInputs();
    await fixture.whenStable();

    const options: NodeListOf<HTMLOptionElement> = fixture.nativeElement.querySelectorAll('option');
    const values = Array.from(options).map(option => Number(option.value));

    expect(values).toEqual([5, 10, 15, 25]);
  });

  it('should render custom page size options when provided', async () => {
    setInputs({ pageSizeOptions: [20, 50] });
    await fixture.whenStable();

    const options: NodeListOf<HTMLOptionElement> = fixture.nativeElement.querySelectorAll('option');
    const values = Array.from(options).map(option => Number(option.value));

    expect(values).toEqual([20, 50]);
  });

  it('should preselect the current page size in the select', async () => {
    setInputs({ pageSize: 15 });
    await fixture.whenStable();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#pageSize');

    expect(Number(select.value)).toBe(15);
  });

  it('should emit pageSizeChange when the select value changes', async () => {
    setInputs();
    await fixture.whenStable();

    const emitSpy = vi.spyOn(component.pageSizeChange, 'emit');

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#pageSize');
    select.value = '25';
    select.dispatchEvent(new Event('change'));

    expect(emitSpy).toHaveBeenCalledWith(25);
  });

  it('should emit pageChange when ngb-pagination emits pageChange', async () => {
    setInputs();
    await fixture.whenStable();

    const emitSpy = vi.spyOn(component.pageChange, 'emit');

    component.onPageChange(3);

    expect(emitSpy).toHaveBeenCalledWith(3);
  });
});
