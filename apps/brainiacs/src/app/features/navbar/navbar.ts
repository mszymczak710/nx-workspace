import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AVAILABLE_LANGS } from '../../core/utils/language.config';
import { NAV_ITEMS } from '../../core/utils/navigation.config';

@Component({
  selector: 'brn-navbar',
  imports: [TranslocoModule, NgbDropdownModule, NgbCollapseModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  private readonly translocoService = inject(TranslocoService);

  readonly activeLang = this.translocoService.activeLang;
  readonly isCollapsed = signal(true);

  readonly navItems = NAV_ITEMS;
  readonly availableLangs = AVAILABLE_LANGS;

  readonly otherLangs = computed(() => this.availableLangs.filter(lang => lang.code !== this.activeLang()));

  changeLocale(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }
}
