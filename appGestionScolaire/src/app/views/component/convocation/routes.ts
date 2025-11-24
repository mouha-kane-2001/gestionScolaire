import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./convocation-list/convocation-list.component').then(m => m.ConvocationListComponent),
    data: {
      title:  ` Convocations`
    }
    }
    ,
      {
    path: 'envoie',
    loadComponent: () => import('./convocation-form/convocation-form.component').then(m => m.ConvocationFormComponent),
    data: {
      title:  ` Convocations`
    }
    }

];

