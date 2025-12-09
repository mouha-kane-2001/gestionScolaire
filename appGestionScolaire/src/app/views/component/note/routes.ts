
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
  {
    path: 'saisiMasse',
    loadComponent: () => import('./bulk-notes/bulk-notes.component').then(m => m.BulkNotesComponent),
    data: { title: 'saisi note en masse' }
  },
   {
    path: 'voirNotes',
    loadComponent: () => import('./prof-voir-note/prof-voir-note.component').then(m => m.ProfVoirNoteComponent),
    data: { title: 'saisi note en masse' }
  },
  {
  path: 'bulk-edit',
  loadComponent: () => import('./bulk-notes/bulk-notes.component').then(m => m.BulkNotesComponent),
  data: { title: 'Modifier notes en masse' }
},

];
