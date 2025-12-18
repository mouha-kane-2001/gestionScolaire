
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ajouter',
    loadComponent: () => import('./form-user/utilisateur.component').then(m => m.UtilisateurComponent),
    data: { title: 'Liste des utilisateurs' }
  },
  {
    path: '',
    loadComponent: () => import('./list-user/list-user.component').then(m => m.ListUserComponent),
    data: { title: 'Liste un utilisateur' }
  },
{
    path: 'edit/:id',
    loadComponent: () => import('./form-user/utilisateur.component').then(m => m.UtilisateurComponent),
    data: { title: 'Modifier un utilisateur' }
  }
];
