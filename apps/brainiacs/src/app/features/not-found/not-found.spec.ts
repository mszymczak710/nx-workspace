import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getTranslocoModule } from '@libs/shared/core/testing';

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class HomeComponentStub {}

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound, getTranslocoModule()],
      providers: [provideRouter([{ path: 'home', component: HomeComponentStub }])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /home on button click', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    await fixture.whenStable();

    expect(location.path()).toBe('/home');
  });
});
