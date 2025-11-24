
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notifications-menu.component').then(m => m. NotificationsMenuComponent),
    data: { title: '' }
  },
   ];
