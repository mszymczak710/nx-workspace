import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'brn-layout',
  imports: [RouterOutlet, Navbar, TranslocoModule],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {}
