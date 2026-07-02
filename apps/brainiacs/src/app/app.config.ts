import { httpErrorInterceptor } from '@libs/shared/core/interceptors';
import { initializeApp, provideAppTransloco } from '@libs/shared/core/utils';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

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
    provideAppTransloco(['pl', 'en'], 'pl')
  ]
};
