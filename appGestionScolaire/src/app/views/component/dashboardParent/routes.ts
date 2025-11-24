import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboardParent.component').then(m => m.DashboardParentComponent),
    data: {
      title:  `Dashboard`
    }
  }
];

