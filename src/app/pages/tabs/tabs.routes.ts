import { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'workouts',
        loadComponent: () =>
          import('@pages/workouts/workouts.page').then(
            (m) => m.WorkoutsPage,
          ),
      },
      {
        path: '',
        redirectTo: 'workouts',
        pathMatch: 'full',
      },
    ],
  },
];
