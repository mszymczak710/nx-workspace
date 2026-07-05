import { TranslocoService } from '@jsverse/transloco';
import { ToastService } from '../services/toast/toast.service';

import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(
    catchError(error => {
      runInInjectionContext(injector, () => {
        const toastService = inject(ToastService);
        const translocoService = inject(TranslocoService);
        const router = inject(Router);

        const key = `errors.http.${error.status}`;
        const translation = translocoService.translate(key);
        const message = translation === key ? translocoService.translate('errors.http.unknown') : translation;

        toastService.showErrorMessage(message);

        if (error.status === HttpStatusCode.NotFound) {
          router.navigate(['/404']);
        }
      });

      return throwError(() => error);
    })
  );
};
