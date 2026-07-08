import { httpErrorInterceptor } from '@libs/shared/core/interceptors';
import { TranslocoTitleStrategy } from '@libs/shared/core/services';
import { initializeApp, provideAppTransloco } from '@libs/shared/core/utils';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { languageHeaderInterceptor } from './core/interceptors/language-header.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => initializeApp()),
    provideHttpClient(withInterceptors([httpErrorInterceptor, languageHeaderInterceptor])),
    provideToastr({
      timeOut: 3000,
      preventDuplicates: true
    }),
    provideAppTransloco(['pl', 'en'], 'pl'),
    { provide: TitleStrategy, useClass: TranslocoTitleStrategy }
  ]
};
