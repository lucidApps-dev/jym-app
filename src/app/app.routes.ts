import { Routes } from '@angular/router';

import { authGuard, loginGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('@pages/auth/auth.page').then((m) => m.AuthPage),
    canActivate: [loginGuard],
  },
  {
    path: 'tabs',
    loadChildren: () => import('@pages/tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'workouts',
    loadComponent: () =>
      import('@pages/workouts/workouts.page').then((m) => m.WorkoutsPage),
    canActivate: [authGuard],
  },
];
