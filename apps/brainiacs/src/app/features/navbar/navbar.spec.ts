import { TranslocoService } from '@jsverse/transloco';
import { getTranslocoModule } from '@libs/shared/core/testing';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Navbar } from './navbar';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class HomeComponentStub {}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let translocoService: TranslocoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, getTranslocoModule(), NgbDropdownModule],
      providers: [provideRouter([{ path: 'home', component: HomeComponentStub }])]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all nav items', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.nav-link');

    expect(links.length).toBe(component.navItems.length);
  });

  it('should mark disabled nav items with the disabled class and no routerLink', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.nav-link');

    component.navItems.forEach((item, index) => {
      expect(links[index].classList.contains('disabled')).toBe(!!item.disabled);
    });
  });

  it('should list only languages other than the active one in the dropdown', () => {
    const activeLang = component.activeLang();
    const codes = component.otherLangs().map(lang => lang.code);

    expect(codes).not.toContain(activeLang);
    expect(codes.length).toBe(component.availableLangs.length - 1);
  });

  it('should render a dropdown item for each other language', () => {
    const items: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[ngbDropdownItem]');

    expect(items.length).toBe(component.otherLangs().length);
  });

  it('should toggle isCollapsed when the navbar toggler is clicked', async () => {
    expect(component.isCollapsed()).toBe(true);

    const toggler: HTMLButtonElement = fixture.nativeElement.querySelector('.navbar-toggler');
    toggler.click();
    await fixture.whenStable();

    expect(component.isCollapsed()).toBe(false);

    toggler.click();
    await fixture.whenStable();

    expect(component.isCollapsed()).toBe(true);
  });

  it('should call translocoService.setActiveLang when a dropdown language item is clicked', async () => {
    const setActiveLangSpy = vi.spyOn(translocoService, 'setActiveLang');
    const otherLang = component.otherLangs()[0];

    const item: HTMLButtonElement = fixture.nativeElement.querySelector('[ngbDropdownItem]');
    item.click();
    await fixture.whenStable();

    expect(setActiveLangSpy).toHaveBeenCalledWith(otherLang.code);
  });

  it('should change locale to pl when current lang is en', () => {
    const setActiveLangSpy = vi.spyOn(translocoService, 'setActiveLang');

    component.changeLocale('pl');

    expect(setActiveLangSpy).toHaveBeenCalledWith('pl');
    expect(component.activeLang()).toBe('pl');
  });

  it('should change locale to en when current lang is pl', () => {
    const setActiveLangSpy = vi.spyOn(translocoService, 'setActiveLang');

    component.changeLocale('en');

    expect(setActiveLangSpy).toHaveBeenCalledWith('en');
    expect(component.activeLang()).toBe('en');
  });
});
