import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

 import { ProfLayoutComponent } from './layout/prof-layout/prof-layout.component';
import { ParentLayoutComponent } from './layout/parent-layout/parent-layout.component';
import { EleveLayoutComponent } from './layout/eleve-layout/eleve-layout.component';
import { authGuard } from './guards/auth.guard';
 export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
     component: AdminLayoutComponent,
//  canActivate: [authGuard],
//data: { role: 'ADMIN' },

    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/component/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'affectation',
        loadChildren: () => import('./views/component/prof-classe/routes').then((m) => m.routes)
      },
        {
        path: 'messages',
        loadChildren: () => import('./views/component/messages/routes').then((m) => m.routes)
      },
       {
        path: 'convocations',
        loadChildren: () => import('./views/component/convocation/routes').then((m) => m.routes)
      },
       {
        path: 'notifications',
        loadChildren: () => import('./views/component/notifications-menu/routes').then((m) => m.routes)
      },
      {
        path: 'users',
        loadChildren: () => import('./views/component/utilisateur/routes').then((m) => m.routes)
      },
    ]
  },
   {
    path: 'prof',
    component: ProfLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/component/dashboardProf/routes').then((m) => m.routes)
      },
       {
        path: 'messages',
        loadChildren: () => import('./views/component/messages/routes').then((m) => m.routes)
      },
      {
        path: 'notes',
        loadChildren: () => import('./views/component/note/routes').then((m) => m.routes)
      },
       {
        path: 'absences',
        loadChildren: () => import('./views/component/absent/routes').then((m) => m.routes)
      },
       {
        path: 'notifications',
        loadChildren: () => import('./views/component/notifications-menu/routes').then((m) => m.routes)
      },
    ]
  },
   {
    path: 'parent',
    component: ParentLayoutComponent,


    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/component/dashboardParent/routes').then((m) => m.routes)
      },
      {
        path: 'messages',
        loadChildren: () => import('./views/component/messages/routes').then((m) => m.routes)
      },
       {
        path: 'notes',
        loadChildren: () => import('./views/component/note/routes').then((m) => m.routes)
      },
       {
        path: 'notifications',
        loadChildren: () => import('./views/component/notifications-menu/routes').then((m) => m.routes)
      },
       {
        path: 'convocations',
        loadChildren: () => import('./views/component/convocation/routes').then((m) => m.routes)
      },
       {
        path: 'absences',
        loadChildren: () => import('./views/component/absent/routes').then((m) => m.routes)
      },
    ]
  },
   {
    path: 'eleve',
    component: EleveLayoutComponent,


    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/component/dashboardEleve/routes').then((m) => m.routes)
      },
       {
        path: 'messages',
        loadChildren: () => import('./views/component/messages/routes').then((m) => m.routes)
      },
       {
        path: 'notes',
        loadChildren: () => import('./views/component/note/routes').then((m) => m.routes)
      },
       {
        path: 'notifications',
        loadChildren: () => import('./views/component/notifications-menu/routes').then((m) => m.routes)
      },
       {
        path: 'absences',
        loadChildren: () => import('./views/component/absent/routes').then((m) => m.routes)
      },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Login Page' }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: { title: 'Register Page' }
  },
  { path: '**', redirectTo: 'NOTFOUND' },


        {
    path: 'utilisateurAjout',
    loadComponent: () => import('./views/component/utilisateur/form-user/utilisateur.component').then(m => m. UtilisateurComponent),
    data: { title: 'user ajot' }
  },

];
