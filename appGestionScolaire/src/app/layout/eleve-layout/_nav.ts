import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
 {
    name: 'Dashboard Élève',
    url: '/eleve/dashboard',
    iconComponent: { name: 'cil-speedometer' }  // OK
  },
  {
    name: 'Messages',
    url: '/eleve/messages/eleve',
    iconComponent: { name: 'cil-envelope-open' }  // icône message propre
  },
  {
    name: 'Absences',
    url: '/eleve/absences/seleve',
    iconComponent: { name: 'cil-user-unfollow'  }   // icône d’absence ✔
  },
  {
    name: 'Notes',
    url: '/eleve/notes/eleve',
    iconComponent: { name: 'cil-notes' } // icône notes ✔
  },
  {
    name: 'Bulletin',
    url: '/taches',
    iconComponent: { name: 'cil-description' } // icône bulletin/document ✔
  }
];
