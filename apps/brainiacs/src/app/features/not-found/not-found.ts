import { TranslocoModule } from '@jsverse/transloco';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'brn-not-found',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFound {}
