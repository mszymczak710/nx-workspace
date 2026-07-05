import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Layout } from './features/layout/layout';

@Component({
  selector: 'brn-root',
  imports: [Layout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
