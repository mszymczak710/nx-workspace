import { inject, Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

type ToastType = 'error' | 'info' | 'success' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastrService = inject(ToastrService);

  private readonly toastMethods: Record<ToastType, (message: string) => void> = {
    success: message => this.toastrService.success(message),
    error: message => this.toastrService.error(message),
    info: message => this.toastrService.info(message),
    warning: message => this.toastrService.warning(message)
  };

  private showMessage(type: ToastType, message: string): void {
    this.toastMethods[type](message);
  }

  showSuccessMessage(message: string): void {
    this.showMessage('success', message);
  }

  showErrorMessage(message: string): void {
    this.showMessage('error', message);
  }

  showInfoMessage(message: string): void {
    this.showMessage('info', message);
  }

  showWarningMessage(message: string): void {
    this.showMessage('warning', message);
  }
}
