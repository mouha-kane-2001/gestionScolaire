import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboardProf.component').then(m => m.DashboardProfComponent),
    data: {
      title:  `Dashboard`
    }
  }
];

