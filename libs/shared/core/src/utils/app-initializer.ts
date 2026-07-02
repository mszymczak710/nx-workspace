import { TranslocoService } from '@jsverse/transloco';

import { inject } from '@angular/core';

import { firstValueFrom } from 'rxjs';

export const initializeApp = (): Promise<unknown> => {
  const translocoService = inject(TranslocoService);
  return firstValueFrom(translocoService.load(translocoService.getActiveLang()));
};
