
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'absent',
    loadComponent: () => import('./marquer-absent/marquer-absent.component').then(m => m. MarquerAbsentComponent),
    data: { title: '' }
  },
   {
    path: 'listePresence',
    loadComponent: () => import('./liste-presence-absent/liste-presence-absent.component').then(m => m.ListePresenceAbsentComponent),
    data: { title: '' }
  },
   {
    path: 'seleve',
    loadComponent: () => import('./suivre-abscence-eleve/suivre-abscence-eleve.component').then(m => m. SuivreAbscenceEleveComponent),
    data: { title: '' }
  },
     {
    path: 'sparent',
    loadComponent: () => import('./suivre-abscence-parent/suivre-abscence-parent.component').then(m => m. SuivreAbscenceParentComponent),
    data: { title: '' }
  },


];
