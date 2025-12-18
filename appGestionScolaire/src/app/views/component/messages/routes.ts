
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin-messages/admin-messages.component').then(m => m.AdminMessagesComponent),
    data: { title: '' }
  },
  {
    path: 'eleve',
    loadComponent: () => import('./eleve-messages/eleve-messages.component').then(m => m.EleveMessagesComponent),
    data: { title: '' }
  },
{
    path: 'parent',
    loadComponent: () => import('./parent-messages/parent-messages.component').then(m => m. ParentMessagesComponent),
    data: { title: '' }
  },
  {
    path: 'prof',
    loadComponent: () => import('./prof-messages/prof-messages.component').then(m => m.ProfMessagesComponent),
    data: { title: '' }
  }
];
