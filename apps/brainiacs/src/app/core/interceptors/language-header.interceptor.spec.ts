import { TranslocoService } from '@jsverse/transloco';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { languageHeaderInterceptor } from './language-header.interceptor';

describe('languageHeaderInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let translocoServiceMock: { getActiveLang: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    translocoServiceMock = {
      getActiveLang: vi.fn().mockReturnValue('pl')
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([languageHeaderInterceptor])),
        provideHttpClientTesting(),
        { provide: TranslocoService, useValue: translocoServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add Accept-Language header with the current active language', () => {
    httpClient.get('/api/users').subscribe();

    const req = httpTestingController.expectOne('/api/users');
    expect(req.request.headers.get('Accept-Language')).toBe('pl');

    req.flush({});
  });

  it('should reflect a different active language', () => {
    translocoServiceMock.getActiveLang.mockReturnValue('en');

    httpClient.get('/api/users').subscribe();

    const req = httpTestingController.expectOne('/api/users');
    expect(req.request.headers.get('Accept-Language')).toBe('en');

    req.flush({});
  });

  it('should preserve existing headers on the request', () => {
    httpClient.get('/api/users', { headers: { Authorization: 'Bearer token123' } }).subscribe();

    const req = httpTestingController.expectOne('/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
    expect(req.request.headers.get('Accept-Language')).toBe('pl');

    req.flush({});
  });
});
