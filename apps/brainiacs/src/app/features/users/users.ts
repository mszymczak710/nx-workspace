import { TranslocoModule } from '@jsverse/transloco';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { UserStore } from '../../core/store/user/user.store';
import { UserFormDialog } from './components/user-form-dialog/user-form-dialog';
import { UsersTable } from './components/users-table/users-table';

@Component({
  selector: 'brn-users',
  imports: [TranslocoModule, UsersTable],
  templateUrl: './users.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Users {
  private readonly modal = inject(NgbModal);
  private readonly userStore = inject(UserStore);

  readonly loading = this.userStore.loading;

  addUser(): void {
    const modalRef = this.modal.open(UserFormDialog, {
      size: 'md',
      backdrop: 'static',
      beforeDismiss: () => modalRef.componentInstance.canDismiss()
    });
  }
}
