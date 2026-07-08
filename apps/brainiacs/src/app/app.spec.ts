import { TranslocoService } from '@jsverse/transloco';
import { getTranslocoModule } from '@libs/shared/core/testing';

import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { TranslocoTitleStrategy } from '@libs/shared/core/services';
import { of } from 'rxjs';
import { App } from './app';

describe('App', () => {
  let translocoService: TranslocoService;
  let titleStrategy: TranslocoTitleStrategy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, getTranslocoModule()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        },
        { provide: TitleStrategy, useClass: TranslocoTitleStrategy }
      ]
    }).compileComponents();

    translocoService = TestBed.inject(TranslocoService);
    titleStrategy = TestBed.inject(TitleStrategy) as TranslocoTitleStrategy;
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();

    expect(app).toBeTruthy();
  });

  it('should set the document language to the active language on creation', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    expect(document.documentElement.lang).toBe(translocoService.activeLang());
  });

  it('should update the document language when the active language changes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const otherLang = translocoService.activeLang() === 'en' ? 'pl' : 'en';

    translocoService.setActiveLang(otherLang);
    await fixture.whenStable();

    expect(document.documentElement.lang).toBe(otherLang);
  });

  it('should set the document title from the active route once resolved', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    titleStrategy.titleKey.set('users.header.title');
    await fixture.whenStable();

    expect(document.title).toBe(translocoService.translate('users.header.title'));
  });

  it('should update the document title when the active language changes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    titleStrategy.titleKey.set('users.header.title');
    await fixture.whenStable();

    const otherLang = translocoService.activeLang() === 'en' ? 'pl' : 'en';
    translocoService.setActiveLang(otherLang);
    await fixture.whenStable();

    expect(document.title).toBe(translocoService.translate('users.header.title', {}, otherLang));
  });
});
