import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Layout } from './features/layout/layout';

@Component({
  imports: [Layout],
  selector: 'brn-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
