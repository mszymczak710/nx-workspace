import { HttpMethod } from '../../types/http.method.model';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TranslocoLoaderService } from './transloco-loader.service';

describe('TranslocoLoaderService', () => {
  let service: TranslocoLoaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TranslocoLoaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch translation for given language', () => {
    service.getTranslation('pl').subscribe(translation => {
      expect(translation).toEqual({ loading: 'Trwa ładowanie' });
    });

    const req = httpMock.expectOne('/i18n/pl.json');
    expect(req.request.method).toBe(HttpMethod.Get);
    req.flush({ loading: 'Trwa ładowanie' });
  });
});
