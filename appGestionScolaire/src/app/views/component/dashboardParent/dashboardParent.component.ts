import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/utilisateur/user.service';
import { AbsenceService } from '../../../services/absence/absence.service';
import { NotesService } from '../../../services/note/notes.service';
import { Eleve } from '../../../models/eleve.model';
import { ConvocationService } from '../../../services/convocation/convocation.service';
import { Convocation } from '../../../models/convocation.model';

// Interfaces pour typer nos données


interface Absence {
  id: number;
  date_absence: string;
  justifiee: boolean;
  motif: string;
  eleve_id: number;
  eleve?: {   prenom: string; nom: string};
}



export interface NoteRecente {
  eleve: string;
  classe: string;
  notes: {
    id: number;
    matiere: string;
    prof: string;
    type: string;
    valeur: string | number;
    date: string;
    eleve ?: { id: number;
      prenom: string;
      nom: string;
      }
  }[];
}


@Component({
  selector: 'app-dashboard-parent',
  templateUrl: './dashboardParent.component.html',
  styleUrls: ['./dashboardParent.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    ChartjsComponent,
    ButtonDirective,
     DecimalPipe
  ]
})
export class DashboardParentComponent implements OnInit {

  constructor(
  private authService: AuthService,
  private userService: UserService,
  private absenceService: AbsenceService,
  private notesService: NotesService,
  private convocationService: ConvocationService
) {}
  // Données des élèves
  eleves: Eleve[] = [
      ];
      // Ajoutez ces propriétés dans la classe
userPrenom: string = '';
userNom: string = '';

  // Données des absences récentes
  absencesRecentes: Absence[] = [

  ];

  // Convocations récentes
  convocationsRecentes: Convocation[] = [

  ];

  // Notes récentes
  notesRecentes: NoteRecente[] = [

  ];

  // Statistiques
  stats = {
    totalEleves: 0,
    absencesNonJustifiees: 0,
    convocationsEnAttente: 0,
    moyenneGenerale: 14.2
  };

  // Données pour les graphiques
  chartData = {
    notes: {
      labels: ['Maths', 'Français', 'Histoire', 'SVT', 'Anglais'],
      datasets: [
        {
          label: 'Moyennes par matière',
          backgroundColor: 'rgba(77, 189, 116, 0.2)',
          borderColor: 'rgba(77, 189, 116, 1)',
          borderWidth: 2,
          data: [15.5, 12, 18, 14.5, 16]
        }
      ]
    },
    presence: {
      labels: ['Présent', 'Absent justifié', 'Absent non justifié'],
      datasets: [
        {
          data: [85, 10, 5],
          backgroundColor: ['#4dbd74', '#ffc107', '#f86c6b']
        }
      ]
    }
  };

  chartOptions = {
    notes: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 20,
          ticks: {
            stepSize: 5
          }
        }
      }
    },
    presence: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const
        }
      }
    }
  };

  ngOnInit() {

  this.chargerEleves();
  this.chargerAbsencesRecentes();
  this.chargerConvocationsRecentes();
  this.chargerNotesRecentes();

  this.loadUserInfo();

  }

  // Nouvelle méthode pour charger les infos utilisateur
loadUserInfo(): void {
  const userInfo = this.authService.getUserInfo();

  if (userInfo.nomUtilisateur) {
    const nomComplet = userInfo.nomUtilisateur.split(' ');
    if (nomComplet.length >= 2) {
      this.userNom = nomComplet[0];
      this.userPrenom = nomComplet.slice(1).join(' ');
    } else {
      this.userNom = userInfo.nomUtilisateur;
      this.userPrenom = '';
    }
  } else {
    this.userPrenom = 'Parent';
    this.userNom = '';
  }
}

  chargerConvocationsRecentes() {
  const parentId = this.authService.getParentId();

  this.convocationService.getConvocationsByParent(parentId!).subscribe({
    next: (data) => {
      this.convocationsRecentes = data.slice(0, 5);
 this.stats.convocationsEnAttente = data.filter((c: Convocation) => c.etat === 'non_lu').length;
     }
  });
}


chargerEleves() {
  const parentId = this.authService.getParentId();
  if (!parentId) return;

  this.userService.getEnfantsParParent(parentId).subscribe({
    next: (data) => {
      this.eleves = data;
      this.stats.totalEleves = this.eleves.length;

      // Charger les absences seulement après avoir récupéré les élèves
      this.chargerAbsencesRecentes();
      // Charger les notes seulement après
      this.chargerNotesRecentes();
    },
    error: (err) => console.error(err)
  });
}


 chargerAbsencesRecentes() {
  const parentId = this.authService.getParentId();
  if (!parentId) {
    console.error('Parent ID non trouvé');
    return;
  }


  this.absenceService.getAbsencesParParent(parentId).subscribe({
    next: (eleves: any[]) => {

      this.absencesRecentes = [];

       this.absencesRecentes = [];

this.absenceService.getAbsencesParParent(parentId).subscribe({
  next: (eleves: any[]) => {
    eleves.forEach(eleve => {
      if (eleve.absences && eleve.absences.length) {
        this.absencesRecentes.push(
          ...eleve.absences.map((a: any) => ({
            ...a,
            eleve: eleve.user // maintenant `user` contient prenom et nom
          }))
        );
      }
    });

    // Trier par date décroissante
    this.absencesRecentes.sort((a, b) => new Date(b.date_absence).getTime() - new Date(a.date_absence).getTime());

    // Garder seulement les 5 dernières
    this.absencesRecentes = this.absencesRecentes.slice(0, 5);

   },
  error: err => console.error(err)
});
    },
    error: (err) => console.error(err)
  });


}





  chargerNotesRecentes() {
  const parentId = this.authService.getParentId();

  this.notesService.getNotesParParent(parentId!).subscribe({
    next: (data) => {
      this.notesRecentes = data.slice(0, 5);
      console.log('Notes récentes chargées:', this.notesRecentes);
     }
  });
}









 getStatutBadgeClass(etat?: 'non_lu' | 'lu'): string {
  switch(etat) {
    case 'non_lu': return 'bg-warning';
    case 'lu': return 'bg-success';
    default: return 'bg-secondary';
  }
}

getStatutText(etat?: 'non_lu' | 'lu'): string {
  switch(etat) {
    case 'non_lu': return 'Non lu';
    case 'lu': return 'Lu';
    default: return 'Inconnu';
  }
}

  getAbsenceBadgeClass(justifiee: boolean): string {
    return justifiee ? 'bg-success' : 'bg-danger';
  }

  getAbsenceText(justifiee: boolean): string {
    return justifiee ? 'Justifiée' : 'Non justifiée';
  }

  getNoteColor(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 14) return 'text-info';
    if (note >= 12) return 'text-primary';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

  // Méthodes de formatage
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
}
