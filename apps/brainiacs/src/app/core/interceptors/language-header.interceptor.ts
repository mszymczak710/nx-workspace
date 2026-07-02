import { TranslocoService } from '@jsverse/transloco';

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const languageHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);
  const lang = translocoService.getActiveLang();

  const cloned = req.clone({
    setHeaders: { 'Accept-Language': lang }
  });

  return next(cloned);
};
