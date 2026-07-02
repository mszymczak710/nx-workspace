import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { ModuleWithProviders } from '@angular/core';

export const getTranslocoModule = (options: TranslocoTestingOptions = {}): ModuleWithProviders<TranslocoTestingModule> => {
  return TranslocoTestingModule.forRoot({
    langs: { en: {}, pl: {} },
    translocoConfig: {
      availableLangs: ['en', 'pl'],
      defaultLang: 'en'
    },
    preloadLangs: true,
    ...options
  });
};
