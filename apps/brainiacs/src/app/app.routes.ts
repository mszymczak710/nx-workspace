import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users').then(c => c.Users)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home)
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found').then(c => c.NotFound)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
