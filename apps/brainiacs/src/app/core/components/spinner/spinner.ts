import { TranslocoModule } from '@jsverse/transloco';

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type BootstrapColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'brn-spinner',
  imports: [TranslocoModule, NgClass],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Spinner {
  readonly visible = input.required<boolean>();
  readonly size = input<SpinnerSize>('sm');
  readonly label = input<string>('shared.loading');
  readonly color = input<BootstrapColor>('primary');
}
