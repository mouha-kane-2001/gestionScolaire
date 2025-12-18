
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./prof-classe.component').then(m => m.ProfClasseComponent),
    data: { title: 'Liste des utilisateurs' }
  },

];
