import { TranslocoModule } from '@jsverse/transloco';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'brn-home',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {}
