import { TranslocoModule } from '@jsverse/transloco';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'brn-user-table-pagination',
  imports: [TranslocoModule, FormsModule, NgbPagination],
  templateUrl: './user-table-pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTablePagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly collectionSize = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 15, 25]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  onPageSizeChange(pageSize: string): void {
    this.pageSizeChange.emit(Number(pageSize));
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
