import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboardEleve.component').then(m => m.DashboardEleveComponent),
    data: {
      title:  `Dashboard `
    }
  }
];

