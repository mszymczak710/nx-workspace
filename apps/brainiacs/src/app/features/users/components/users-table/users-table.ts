import { TranslocoModule } from '@jsverse/transloco';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Spinner } from '../../../../core/components/spinner/spinner';
import { UserStore } from '../../../../core/store/user/user.store';
import { User } from '../../../../core/types/user.model';
import { UserDeleteConfirmationDialog } from '../user-delete-confirmation-dialog/user-delete-confirmation-dialog';
import { UserFormDialog } from '../user-form-dialog/user-form-dialog';
import { UserTablePagination } from './components/user-table-pagination/user-table-pagination';
import { UserTableRow } from './components/user-table-row/user-table-row';

@Component({
  selector: 'brn-users-table',
  imports: [TranslocoModule, UserTableRow, UserTablePagination, Spinner],
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersTable {
  private readonly userStore = inject(UserStore);
  private readonly modal = inject(NgbModal);

  readonly page = this.userStore.currentPage;
  readonly pageSize = this.userStore.pageSize;
  readonly totalElements = this.userStore.totalElements;
  readonly users = this.userStore.entities;
  readonly loading = this.userStore.loading;

  constructor() {
    this.userStore.loadUsers({ page: this.page(), pageSize: this.pageSize() });
  }

  deleteUser(user: User): void {
    this.userStore.setSelectedUser(user);
    this.modal.open(UserDeleteConfirmationDialog, { size: 'md', backdrop: 'static' });
  }

  updateUser(user: User): void {
    this.userStore.setSelectedUser(user);
    const modalRef = this.modal.open(UserFormDialog, {
      size: 'md',
      backdrop: 'static',
      beforeDismiss: () => modalRef.componentInstance.canDismiss()
    });
  }

  onPageSizeChange(pageSize: number): void {
    this.userStore.changePageSize(pageSize);
  }

  onPageChange(page: number): void {
    const pageSize = this.userStore.pageSize();
    this.userStore.loadUsers({ page, pageSize });
  }
}
