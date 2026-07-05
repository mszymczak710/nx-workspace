import { getTranslocoModule } from '@libs/shared/core/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  let component: Spinner;
  let fixture: ComponentFixture<Spinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spinner, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(Spinner);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render spinner when visible is true', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeTruthy();
  });

  it('should not render spinner when visible is false', async () => {
    fixture.componentRef.setInput('visible', false);
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeFalsy();
  });

  it('should apply default size class', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('spinner-border-sm');
  });

  it('should apply custom size class', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('spinner-border-xl');
  });

  it('should apply default color class', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('text-primary');
  });

  it('should apply custom color class', async () => {
    fixture.componentRef.setInput('color', 'danger');
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('text-danger');
  });

  it('should render visually hidden label', () => {
    const span = fixture.nativeElement.querySelector('.visually-hidden');
    expect(span).toBeTruthy();
  });
});
