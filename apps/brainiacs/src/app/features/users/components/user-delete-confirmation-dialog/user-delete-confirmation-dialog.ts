import { TranslocoModule } from '@jsverse/transloco';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Spinner } from '../../../../core/components/spinner/spinner';
import { UserStore } from '../../../../core/store/user/user.store';
import { extractGeneralErrorMessage } from '../../../../core/utils/http-error-mapper';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'brn-user-delete-confirmation-dialog',
  imports: [TranslocoModule, Spinner],
  templateUrl: './user-delete-confirmation-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDeleteConfirmationDialog {
  private readonly modal = inject(NgbActiveModal);
  private readonly destroyRef = inject(DestroyRef);
  readonly userStore = inject(UserStore);

  readonly errorMessage = signal<string>('');
  readonly saving = signal<boolean>(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.userStore.setSelectedUser(null));

    effect(() => {
      if (!this.userStore.selectedUser() && !this.saving()) {
        this.modal.close();
      }
    });
  }

  cancel(): void {
    this.modal.dismiss();
  }

  deleteUser(): void {
    this.saving.set(true);
    this.userStore
      .deleteUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: error => {
          const errorMessage = extractGeneralErrorMessage(error);
          this.errorMessage.set(errorMessage);
          this.saving.set(false);
        },
        complete: () => {
          this.saving.set(false);
        }
      });
  }
}
