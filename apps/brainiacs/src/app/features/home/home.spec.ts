import { getTranslocoModule } from '@libs/shared/core/testing';

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { beforeEach, describe, expect, it } from 'vitest';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Home } from './home';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class UsersComponentStub {}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, getTranslocoModule()],
      providers: [provideRouter([{ path: 'users', component: UsersComponentStub }])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /users on button click', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    await fixture.whenStable();

    expect(location.path()).toBe('/users');
  });
});
