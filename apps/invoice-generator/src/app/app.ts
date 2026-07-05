import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'klg-root',
  imports: [],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
