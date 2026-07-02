import { provideTransloco } from '@jsverse/transloco';

import { EnvironmentProviders, isDevMode } from '@angular/core';

import { TranslocoLoaderService } from '../services/transloco-loader/transloco-loader.service';

export const provideAppTransloco = (availableLangs: string[], defaultLang = 'pl'): EnvironmentProviders[] => {
  return provideTransloco({
    config: {
      availableLangs,
      defaultLang,
      reRenderOnLangChange: true,
      prodMode: !isDevMode()
    },
    loader: TranslocoLoaderService
  });
};
