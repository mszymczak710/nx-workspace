import { TestBed } from '@angular/core/testing';

import { ToastrService } from 'ngx-toastr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let toastrServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    toastrServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [ToastService, { provide: ToastrService, useValue: toastrServiceMock }]
    });

    service = TestBed.inject(ToastService);
  });

  it.each([
    ['showSuccessMessage', 'success'],
    ['showErrorMessage', 'error'],
    ['showInfoMessage', 'info'],
    ['showWarningMessage', 'warning']
  ] as const)('%s should call toastr.%s with the given message', (serviceMethod, toastrMethod) => {
    service[serviceMethod]('some.key');

    expect(toastrServiceMock[toastrMethod]).toHaveBeenCalledWith('some.key');
    expect(toastrServiceMock[toastrMethod]).toHaveBeenCalledTimes(1);

    const otherMethods = (['success', 'error', 'info', 'warning'] as const).filter(m => m !== toastrMethod);
    otherMethods.forEach(m => expect(toastrServiceMock[m]).not.toHaveBeenCalled());
  });
});
