import { TranslocoModule } from '@jsverse/transloco';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { User } from '../../../../../../core/types/user.model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[brn-user-table-row]',
  imports: [TranslocoModule, NgbTooltipModule],
  templateUrl: './user-table-row.html',
  styleUrl: './user-table-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTableRow {
  readonly user = input.required<User>();
  readonly deleteUser = output<void>();
  readonly updateUser = output<void>();
}
