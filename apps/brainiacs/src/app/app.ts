import { ChangeDetectionStrategy, Component, DOCUMENT, effect, inject } from '@angular/core';
import { TitleStrategy } from '@angular/router';

import { TranslocoService } from '@jsverse/transloco';
import { TranslocoTitleStrategy } from '@libs/shared/core/services';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap, tap } from 'rxjs';
import { Layout } from './features/layout/layout';

@Component({
  selector: 'brn-root',
  imports: [Layout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly translocoService = inject(TranslocoService);
  private readonly titleStrategy = inject(TitleStrategy) as TranslocoTitleStrategy;

  // `selectTranslate` (not the synchronous `translate`) is required here: it re-emits once the
  // active language's translation file finishes loading, whereas `translate()` reads whatever is
  // already cached and would permanently return the raw key if called before that load resolves
  // (e.g. right after switching to a language that hasn't been fetched yet).
  private readonly applyTitle = rxMethod<string | null>(
    pipe(
      switchMap((titleKey: string | null) => (titleKey ? this.translocoService.selectTranslate<string>(titleKey) : of(null))),
      tap((title: string | null) => {
        if (title) {
          this.document.title = title;
        }
      })
    )
  );

  constructor() {
    this.applyTitle(this.titleStrategy.titleKey);

    effect(() => {
      this.document.documentElement.lang = this.translocoService.activeLang();
    });
  }
}
