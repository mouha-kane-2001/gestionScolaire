import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/utilisateur/user.service';
import { AbsenceService } from '../../../services/absence/absence.service';
import { ReferenceService } from '../../../services/reference/reference.service';
import { MessageService } from '../../../services/messages/message.service';

interface ClasseProf {
  id: number;
  nom: string;
  nombreEleves: number;
  absences: number;
}

interface MessageRecu {
  id: number;
  expediteur: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-dashboard-prof',
  templateUrl: 'dashboardProf.component.html',
  styleUrls: ['dashboardProf.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChartjsComponent,

  ]
})
export class DashboardProfComponent implements OnInit {

 constructor(
  private authService: AuthService,
  private userService: UserService,
  private absenceService: AbsenceService,
  private referenceService: ReferenceService,
  private messageService: MessageService // ✅ Ajouter ceci
) {}

  classes: ClasseProf[] = [];
  messagesRecus: MessageRecu[] = [];
  isLoading = true;
  userPrenom: string = '';
userNom: string = '';

  chartData = {
    absences: {
      labels: [] as string[],
      datasets: [
        {
          label: 'Absences',
          backgroundColor: '#f86c6b',
          data: [] as number[]
        }
      ]
    }
  };

  chartOptions = {
    absences: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadClasses();
    this.loadMessages();
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
    this.userPrenom = 'Professeur';
    this.userNom = '';
  }
}

 loadClasses(): void {
  if (this.classes.length > 0) return; // déjà chargé

  const profId = this.authService.getSpecificId();
  this.referenceService.getClassesByProf(profId!).subscribe({
    next: (data: any) => {
      this.classes = Array.isArray(data.classes) ? data.classes : [];
      this.updateChartData();
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
}


   loadMessages(): void {
  const profId = this.authService.getSpecificId(); // ✅ On récupère l'id du prof connecté

  this.messageService.getReceived(profId!).subscribe({
    next: (messages) => {
      this.messagesRecus = messages.map(m => ({
        id: m.id!,
        expediteur: `${m.expediteur_nom ?? 'Inconnu'} ${m.expediteur_prenom ?? ''}`.trim(),
        message: m.contenu,
        date: m.created_at
      }));
    },
    error: (err) => {
      console.error('Erreur lors du chargement des messages :', err);
    }
  });
}


  updateChartData(): void {
    this.chartData.absences.labels = this.classes.map(classe => classe.nom);
    this.chartData.absences.datasets[0].data = this.classes.map(classe => classe.absences);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getTotalEleves(): number {
    return this.classes.reduce((total, classe) => total + classe.nombreEleves, 0);
  }

  getTotalAbsences(): number {
    return this.classes.reduce((total, classe) => total + classe.absences, 0);
  }
}
