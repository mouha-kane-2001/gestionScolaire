
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'attribue',
    loadComponent: () => import('./attribuer-note/attribuer-note.component').then(m => m. AttribuerNoteComponent),
    data: { title: '' }
  },
  {
    path: 'gestion',
    loadComponent: () => import('./gestion-notes/gestion-notes.component').then(m => m.GestionNotesComponent),
    data: { title: '' }
  },
   {
    path: 'parent',
    loadComponent: () => import('./parent-consultenotes/parent-consultenotes.component').then(m => m. ParentConsultenotesComponent),
    data: { title: '' }
  },
   {
    path: 'eleve',
    loadComponent: () => import('./enfant-consultenotes/enfant-consultenotes.component').then(m => m. EnfantConsultenotesComponent),
    data: { title: '' }
  },

];
