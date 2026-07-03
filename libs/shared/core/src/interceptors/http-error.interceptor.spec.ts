import { ToastService } from '../services/toast/toast.service';
import { getTranslocoModule } from '../testing/get-transloco-module';

import { HttpClient, HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let toastServiceMock: { showErrorMessage: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    toastServiceMock = { showErrorMessage: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule({
          langs: {
            en: {
              errors: {
                http: {
                  '400': 'Bad request',
                  '401': 'Unauthorized',
                  '403': 'Forbidden',
                  '404': 'Not found',
                  '500': 'Server error',
                  unknown: 'Unknown error'
                }
              }
            }
          }
        })
      ],
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show translated error message for bad request', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.BadRequest, statusText: 'Bad Request' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Bad request');
  });

  it('should show translated error message for unauthorized', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Unauthorized');
  });

  it('should show translated error message for forbidden', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.Forbidden, statusText: 'Forbidden' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Forbidden');
  });

  it('should show translated error message for not found', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.NotFound, statusText: 'Not Found' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Not found');
  });

  it('should show translated error message for internal server error', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Server error');
  });

  it('should show unknown error message for unrecognized status', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.Conflict, statusText: 'Conflict' });

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith('Unknown error');
  });

  it('should navigate to /404 when status is NotFound', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.NotFound, statusText: 'Not Found' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/404']);
  });

  it('should not navigate for statuses other than NotFound', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error' });

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should rethrow error after showing toast', () => {
    let caughtError: unknown;

    httpClient.get('/api/test').subscribe({ error: err => (caughtError = err) });
    httpMock.expectOne('/api/test').flush({}, { status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error' });

    expect(caughtError).toBeTruthy();
  });
});
