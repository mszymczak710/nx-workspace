import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { beforeEach, describe, expect, it } from 'vitest';

import { TranslocoTitleStrategy } from './transloco-title.strategy';

@Component({ selector: 'lib-test-blank', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class BlankComponent {}

describe('TranslocoTitleStrategy', () => {
  let strategy: TranslocoTitleStrategy;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'with-title', component: BlankComponent, title: 'users.header.title' },
          { path: 'without-title', component: BlankComponent }
        ]),
        { provide: TitleStrategy, useClass: TranslocoTitleStrategy }
      ]
    }).compileComponents();

    strategy = TestBed.inject(TitleStrategy) as TranslocoTitleStrategy;
    router = TestBed.inject(Router);
  });

  it('should have no title key before any navigation', () => {
    expect(strategy.titleKey()).toBeNull();
  });

  it('should expose the resolved route title key after navigation', async () => {
    await router.navigateByUrl('/with-title');

    expect(strategy.titleKey()).toBe('users.header.title');
  });

  it('should expose null when the resolved route has no title', async () => {
    await router.navigateByUrl('/with-title');
    await router.navigateByUrl('/without-title');

    expect(strategy.titleKey()).toBeNull();
  });
});
