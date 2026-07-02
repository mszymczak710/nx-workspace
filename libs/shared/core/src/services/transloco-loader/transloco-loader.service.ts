import { Translation, TranslocoLoader } from '@jsverse/transloco';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoLoaderService implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}
