import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
 {
  name: 'Dashboard Parent',
  url: '/parent/dashboard',
  iconComponent: { name: 'cil-speedometer' }
},
{
  name: 'Messages',
  url: '/parent/messages/parent',
  iconComponent: { name: 'cil-envelope-open'  }
},
{
  name: 'Absences',
  url: '/parent/absences/sparent',
  iconComponent: { name: 'cil-user-unfollow' } // Icône absence/élève non présent
},
{
  name: 'Notes',
  url: '/parent/notes/parent',
  iconComponent: { name: 'cil-pencil' } // Icône cahier/livre → parfait pour notes
},
{
  name: 'Convocation',
  url: '/parent/convocations',
  iconComponent: { name: 'cil-bullhorn' }
},
{
  name: 'Bulletin',
  url: '/parent/bulletin',
  iconComponent: { name: 'cil-description' } // Icône document → idéal pour bulletin
},
{
  name: 'Settings',
  url: '/settings',
  iconComponent: { name: 'cil-settings' }
},

];
