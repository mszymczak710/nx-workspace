import { Injectable, signal } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TranslocoTitleStrategy extends TitleStrategy {
  readonly titleKey = signal<string | null>(null);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.titleKey.set(this.buildTitle(snapshot) ?? null);
  }
}
