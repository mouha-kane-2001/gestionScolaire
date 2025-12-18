import { CommonModule, DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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

import { UserService } from '../../../services/utilisateur/user.service';
import { AbsenceService } from '../../../services/absence/absence.service';
import { ConvocationService } from '../../../services/convocation/convocation.service';
import { MessageService } from '../../../services/messages/message.service';
import { NotesService } from '../../../services/note/notes.service';
import { ReferenceService } from '../../../services/reference/reference.service';
import { Utilisateur } from '../../../models/utilisateur.model';
import {  AuthService} from '../../../services/auth/auth.service';

// Interfaces pour le dashboard admin
interface UtilisateurRecent {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  dateCreation: string;
}

interface ActiviteSysteme {
  utilisateur: string;
  role: string;
  action: string;
  date: string;
  statut: string;
}

interface AlerteUrgente {
  titre: string;
  description: string;
  date: string;
  niveau: string;
}

interface StatsSysteme {
  espaceDisqueUtilise: number;
  memoireUtilisee: number;
  chargeCPU: number;
  derniereMAJ: string;
}

interface DashboardStats {
  // Stats existantes
  totalEleves: number;
  absencesNonJustifiees: number;
  convocationsEnAttente: number;
  moyenneGenerale: number;

  // Nouvelles stats pour admin
  totalUtilisateurs: number;
  professeurs: number;
  eleves: number;
  parents: number;
  totalClasses: number;
  classesActives: number;
  absencesTotal: number;
  convocationsEnCours: number;
  convocationsCetteSemaine: number;
  notesSaisies: number;
  messagesNonLus: number;
  alertesActives: number;
}

interface ChartData {
  notes: any;
  presence: any;
  activite: any;
  repartition: any;
  performance: any;
  absences: any;
}

interface ChartOptions {
  notes: any;
  presence: any;
  activite: any;
  repartition: any;
  performance: any;
  absences: any;
}

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonDirective,
     CardBodyComponent,
    CardComponent,
    CardFooterComponent,
    CardHeaderComponent,
    ColComponent,
     RowComponent,
    ChartjsComponent,

    NgClass,
     DecimalPipe,
    ]
})
export class DashboardComponent implements OnInit {
// Dans la classe DashboardComponent
userPrenom: string = '';
userNom: string = '';
userRole: string = '';


   constructor(
  private userService: UserService,
  private referenceService: ReferenceService,
  private absenceService: AbsenceService,
  private convocationService: ConvocationService,
  private messageService: MessageService,
  private notesService: NotesService,
  private authService : AuthService
) {}

  // Données statistiques complètes pour admin
  stats: DashboardStats = {
    totalEleves: 0,
    absencesNonJustifiees:0,
    convocationsEnAttente:0,
    moyenneGenerale: 14.5,
    totalUtilisateurs: 0,
    professeurs: 0,
    eleves: 0,
    parents: 0,
    totalClasses: 0,
    classesActives: 0,
    absencesTotal: 0,
    convocationsEnCours: 0,
    convocationsCetteSemaine: 0,
    notesSaisies:0,
    messagesNonLus:0,
    alertesActives: 5
  };

  // Données pour l'admin
  activitesRecentes: ActiviteSysteme[] = [

  ];

  alertesUrgentes: AlerteUrgente[] = [

  ];

  utilisateursRecents: UtilisateurRecent[] = [

  ];

  statsSysteme: StatsSysteme = {
    espaceDisqueUtilise: 75,
    memoireUtilisee: 65,
    chargeCPU: 45,
    derniereMAJ: '2024-01-20T16:00:00'
  };

  // Configuration des graphiques étendue
  chartData: ChartData = {
    notes: {
      labels: ['Maths', 'Français', 'Histoire', 'SVT', 'Anglais'],
      datasets: [
        {
          label: 'Moyennes',
          backgroundColor: '#4bc0c0',
          borderColor: '#4bc0c0',
          data: [16.5, 14.0, 18.0, 15.5, 13.0]
        }
      ]
    },
    presence: {
      labels: ['Présent', 'Absent'],
      datasets: [
        {
          data: [85, 15],
          backgroundColor: ['#4dbd74', '#f86c6b']
        }
      ]
    },
    activite: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Connexions',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    },
    repartition: {
      labels: ['Élèves', 'Professeurs', 'Parents', 'Administrateurs'],
      datasets: [
        {
          data: [89, 24, 43, 3],
          backgroundColor: ['#4dbd74', '#ffc107', '#4220c9ff', '#e55353']
        }
      ]
    },
    performance: {
      labels: ['6ème A', '5ème B', '4ème C', '3ème D', '2nde A', '1ère S'],
      datasets: [
        {
          label: 'Moyenne classe',
          backgroundColor: '#321fdb',
          data: [12.5, 13.2, 14.8, 11.9, 15.2, 16.1]
        }
      ]
    },
    absences: {
      labels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      datasets: [
        {
          data: [12, 19, 8, 15, 6, 11, 9],
          backgroundColor: [
            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
            '#9966ff', '#ff9f40', '#c9cbcf'
          ]
        }
      ]
    }
  };

  chartOptions: ChartOptions = {
    notes: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 20
        }
      }
    },
    presence: {
      responsive: true,
      maintainAspectRatio: false
    },
    activite: {
      responsive: true,
      maintainAspectRatio: false
    },
    repartition: {
      responsive: true,
      maintainAspectRatio: false
    },
    performance: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 20
        }
      }
    },
    absences: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  ngOnInit(): void {

   this.loadStats();
  this.loadUtilisateursRecents();
   this.loadCurrentUser();
  this.loadTauxAbsences();
  this.loadMessagesUrgents();
}

// Nouvelle méthode pour charger l'utilisateur connecté

 // Méthode pour charger l'utilisateur connecté
loadCurrentUser(): void {
  const userInfo = this.authService.getUserInfo();

  if (userInfo.nomUtilisateur) {
    // Séparer le nom et prénom (format "Nom Prénom")
    const nomComplet = userInfo.nomUtilisateur.split(' ');
    if (nomComplet.length >= 2) {
      this.userNom = nomComplet[0]; // Nom de famille
      this.userPrenom = nomComplet.slice(1).join(' '); // Prénom (peut être composé)
    } else {
      this.userNom = userInfo.nomUtilisateur;
      this.userPrenom = '';
    }

    // Déterminer le rôle avec libellé plus explicite
    switch(userInfo.typeUtilisateur?.toLowerCase()) {
      case 'admin':
        this.userRole = 'Administrateur';
        break;
      case 'prof':
        this.userRole = 'Professeur';
        break;
      case 'eleve':
        this.userRole = 'Élève';
        break;
      case 'parent':
        this.userRole = 'Parent';
        break;
      default:
        this.userRole = userInfo.typeUtilisateur || 'Utilisateur';
    }
  } else {
    // Valeurs par défaut si aucune info trouvée
    this.userPrenom = 'Utilisateur';
    this.userNom = '';
    this.userRole = 'Administrateur';
  }
}

loadTauxAbsences(): void {
  this.absenceService.getTauxAbsences().subscribe(data => {
     this.chartData.absences = {
      labels: data.map(c => c.nom),
      datasets: [
        {
          data: data.map(c => c.taux),
          backgroundColor: data.map(d => d.taux > 20 ? '#f86c6b' : '#4dbd74')
        }
      ]
    };
  });
}
 loadMessagesUrgents(): void {
  this.messageService.getAll().subscribe(messages => {
    console.log('Tous les messages reçus :', messages); // <-- log de tous les messages

    this.alertesUrgentes = messages
      .filter(m => m.statut !== 'lu' && (m.priorite === 'urgent' || m.priorite === 'critique'))
      .map(m => ({
        titre: m.objet,       // ou m.titre si tu as ce champ
        description: m.contenu,
        date: m.created_at,   // ou m.dateCreation selon ton API
        niveau: m.priorite === 'critique' ? 'critique' : 'important'
      }));

    console.log('Messages urgents filtrés :', this.alertesUrgentes); // <-- log des urgents
  });
}














 loadStats(): void {

  // Utilisateurs
this.userService.getAllUsers().subscribe((users: Utilisateur[]) => {

  this.stats.totalUtilisateurs = users.length;
  this.stats.professeurs = users.filter(u => u.role === 'prof').length;
  this.stats.eleves = users.filter(u => u.role === 'eleve').length;
  this.stats.parents = users.filter(u => u.role === 'parent').length;

});



  // Classes
  this.referenceService.getClasses().subscribe(classes => {
    this.stats.totalClasses = classes.length;
    this.stats.classesActives = classes.filter(c => c.actif === true).length;
  });

 // Absences
this.absenceService.getAbsencesByClasse(0).subscribe((absences: any[]) => {
  this.stats.absencesTotal = absences.length;
   this.stats.absencesNonJustifiees = absences.filter((a: any) => !a.justifiee).length;
});

// Convocations
this.convocationService.getAllConvocations().subscribe((conv: any[]) => {
  this.stats.convocationsEnCours = conv.length;
  this.stats.convocationsEnCours = conv.filter(c => c.etat === 'non_lue').length;

});


  // Notes
  this.notesService.getAllNotes().subscribe(notes => {
    this.stats.notesSaisies = notes.length;
   });

  // Messages
  this.messageService.getAll().subscribe(messages => {
    this.stats.messagesNonLus = messages.filter(m => m.statut !== 'lu').length;
  });
}


isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 jours
}

loadUtilisateursRecents(): void {
  this.userService.getAllUsers().subscribe(users => {
    this.utilisateursRecents = users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map(u => ({
        id: u.id,
        prenom: u.prenom,
        nom: u.nom,
        email: u.email,
        role: u.role,
        dateCreation: u.created_at
      }));
  });
}


  // Méthodes utilitaires existantes
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Nouvelles méthodes pour l'admin
  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'professeur': return 'cil-user';
      case 'admin': return 'cil-settings';
      case 'eleve': return 'cil-education';
      case 'parent': return 'cil-people';
      default: return 'cil-user';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'professeur': return 'bg-warning';
      case 'admin': return 'bg-danger';
      case 'eleve': return 'bg-primary';
      case 'parent': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getAlerteBadgeClass(niveau: string): string {
    switch (niveau) {
      case 'critique': return 'bg-danger';
      case 'important': return 'bg-warning';
      case 'information': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getProgressColor(value: number): string {
    if (value >= 90) return 'danger';
    if (value >= 75) return 'warning';
    if (value >= 50) return 'info';
    return 'success';
  }

  editUser(userId: number): void {
     // Implémentez la logique d'édition
  }

  // Méthodes existantes
  getAbsenceBadgeClass(justifiee: boolean): string {
    return justifiee ? 'bg-success' : 'bg-danger';
  }

  getAbsenceText(justifiee: boolean): string {
    return justifiee ? 'Justifiée' : 'Non justifiée';
  }

  getStatutBadgeClass(etat: string): string {
    switch (etat) {
      case 'en_attente':
        return 'bg-warning';
      case 'confirmee':
        return 'bg-success';
      case 'annulee':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatutText(etat: string): string {
    switch (etat) {
      case 'en_attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmée';
      case 'annulee':
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  }

  getNoteColor(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 12) return 'text-primary';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }
}
