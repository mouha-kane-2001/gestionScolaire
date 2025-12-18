import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/prof/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Messages',
    url: '/prof/messages/prof',
    iconComponent: { name: 'cil-envelope-open'  }
  },
  {
    name: 'Saisir Note',
    url: '/prof/notes/saisiMasse',
    iconComponent: { name: 'cil-pencil' }
  },
   {
    name: 'Voir  Note',
    url: '/prof/notes/voirNotes',
    iconComponent: { name: 'cil-pencil' }
  },
  {
    name: 'Absences',
    url: '/prof/absences/listePresence',
    iconComponent: { name: 'cil-user-unfollow' }
  },
];
