import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
 {
    name: 'Dashboard Admin',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Utilisateurs',
    url: '/users',
    iconComponent: { name: 'cil-people' }
  },
 {
    name: 'Convocation',
    url: '/convocations/envoie',
    iconComponent: { name: 'cil-bullhorn' } // OK
  },
  {
    name: 'Attribuer Classe',
    url: '/affectation',
    iconComponent: { name: 'cil-school' } // remplacer le nom inexistant
  },
  {
    name: 'Messages',
    url: '/messages/admin',
    iconComponent: { name: 'cil-envelope-open' } // remplacer cil-bi-chat-dots
  },
  {
    name: 'Settings',
    url: '/settings',
    iconComponent: { name: 'cil-settings' }
  },
];
