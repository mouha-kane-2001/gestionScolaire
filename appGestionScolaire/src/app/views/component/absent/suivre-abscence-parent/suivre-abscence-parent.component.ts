import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbsenceService } from '../../../../services/absence/absence.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-suivre-abscence-parent',
  imports: [CommonModule,FormsModule],
  templateUrl: './suivre-abscence-parent.component.html',
  styleUrl: './suivre-abscence-parent.component.scss'
})
export class SuivreAbscenceParentComponent implements OnInit, OnDestroy {


  // PROPRIÉTÉS POUR LES ALERTES
  showAlert = false;
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'success';
  alertMessage = '';
  alertTimeout: any = null;

    // MÉTHODES POUR LES ALERTES
  showAlertMessage(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', duration: number = 5000) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Annuler l'alerte précédente si elle existe
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }

    // Auto-fermeture après la durée spécifiée
    this.alertTimeout = setTimeout(() => {
      this.closeAlert();
    }, duration);
  }

  closeAlert() {
    this.showAlert = false;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }




  
  private destroy$ = new Subject<void>();

  enfants: any[] = [];
  selectedEnfant: any = null;
  absences: any[] = [];
  absencesFiltrees: any[] = [];
  matieresUniques: string[] = [];
  motifsUniques: string[] = [];
  loading = {
    enfants: false,
    absences: false
  };

  // Filtres
  filtreMatiere: string = '';
  filtreMotif: string = '';
  filtreJustifiee: string = '';
  filtreDateDebut: string = '';
  filtreDateFin: string = '';

  // Statistiques
  stats = {
    total: 0,
    justifiees: 0,
    nonJustifiees: 0,
    tauxAbsentisme: 0
  };

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerEnfants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chargerEnfants(): void {
    this.loading.enfants = true;
    const parentId = this.authService.getParentId();

    if (parentId) {
      this.absenceService.getAbsencesParParent(parentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            // Normalisation des données des enfants
            if (Array.isArray(response)) {
              this.enfants = response;
            } else if (response && Array.isArray(response.enfants)) {
              this.enfants = response.enfants;
            } else if (response && typeof response === 'object') {
              this.enfants = Object.values(response);
            } else {
              this.enfants = [];
            }

            this.loading.enfants = false;
            console.log('Enfants chargés:', this.enfants);
          },
          error: (err) => {
            console.error('Erreur lors du chargement des enfants:', err);
            this.loading.enfants = false;
            this.enfants = [];
          }
        });
    } else {
      this.loading.enfants = false;
      this.enfants = [];
    }
  }

  voirAbsences(enfant: any): void {
    this.selectedEnfant = enfant;
    this.loading.absences = true;

    this.absenceService.getAbsencesByEleve(enfant.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Normalisation des données d'absences
          if (Array.isArray(response)) {
            this.absences = response;
          } else if (response && Array.isArray(response.absences)) {
            this.absences = response.absences;
          } else if (response && typeof response === 'object') {
            this.absences = Object.keys(response).map(key => ({
              id: key,
              ...response[key]
            }));
          } else {
            this.absences = [];
          }

          this.absencesFiltrees = [...this.absences];
          this.matieresUniques = this.getMatieresUniques();
          this.motifsUniques = this.getMotifsUniques();
          this.calculerStatistiques();
          this.loading.absences = false;
          console.log('Absences chargées:', this.absences);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des absences:', err);
          this.absences = [];
          this.absencesFiltrees = [];
          this.loading.absences = false;
        }
      });
  }

  retour(): void {
    this.selectedEnfant = null;
    this.absences = [];
    this.absencesFiltrees = [];
    this.reinitialiserFiltres();
  }

  // Filtrage des absences
  filtrerAbsences(): void {
    this.absencesFiltrees = this.absences.filter(absence => {
      const matchesMatiere = !this.filtreMatiere ||
        absence.matiere?.nom === this.filtreMatiere;

      const matchesMotif = !this.filtreMotif ||
        absence.motif === this.filtreMotif;

      const matchesJustifiee = !this.filtreJustifiee ||
        absence.justifiee?.toString() === this.filtreJustifiee;

      const matchesDateDebut = !this.filtreDateDebut ||
        new Date(absence.date_absence) >= new Date(this.filtreDateDebut);

      const matchesDateFin = !this.filtreDateFin ||
        new Date(absence.date_absence) <= new Date(this.filtreDateFin);

      return matchesMatiere && matchesMotif && matchesJustifiee &&
             matchesDateDebut && matchesDateFin;
    });

    this.calculerStatistiques();
  }

  // Réinitialiser les filtres
  reinitialiserFiltres(): void {
    this.filtreMatiere = '';
    this.filtreMotif = '';
    this.filtreJustifiee = '';
    this.filtreDateDebut = '';
    this.filtreDateFin = '';
    this.filtrerAbsences();
  }

  // Méthodes utilitaires
  getMatieresUniques(): string[] {
    return [...new Set(this.absences.map(absence => absence.matiere?.nom).filter(Boolean))];
  }

  getMotifsUniques(): string[] {
    return [...new Set(this.absences.map(absence => absence.motif).filter(Boolean))];
  }

  getBadgeClassJustifiee(justifiee: boolean): string {
    return justifiee ? 'badge bg-success' : 'badge bg-danger';
  }

  getTextJustifiee(justifiee: boolean): string {
    return justifiee ? 'Justifiée' : 'Non justifiée';
  }

  getMotifLabel(motif: string): string {
    const labels: { [key: string]: string } = {
      'absent': 'Absent',
      'retard': 'Retard',
      'mauvaise_conduite': 'Mauvaise conduite',
      'non_participation': 'Non participation',
      'non_travail': 'Non travail',
      'cours_manque': 'Cours manqué',
      'sans_billet': 'Sans billet',
      'autre': 'Autre raison'
    };
    return labels[motif] || motif;
  }

  // Calcul des statistiques
  calculerStatistiques(): void {
    this.stats.total = this.absencesFiltrees.length;
    this.stats.justifiees = this.absencesFiltrees.filter(a => a.justifiee).length;
    this.stats.nonJustifiees = this.stats.total - this.stats.justifiees;
    this.stats.tauxAbsentisme = this.stats.total > 0 ?
      Math.round((this.stats.total / 30) * 100) : 0; // Basé sur 30 jours
  }

  // Export des données (optionnel)
  exporterAbsences(): void {
    const data = this.absencesFiltrees.map(absence => ({
      Date: absence.date_absence,
      Élève: this.selectedEnfant?.user?.nom + ' ' + this.selectedEnfant?.user?.prenom,
      Matière: absence.matiere?.nom,
      Motif: this.getMotifLabel(absence.motif),
      Statut: absence.justifiee ? 'Justifiée' : 'Non justifiée',
      Professeur: absence.professeur?.user?.nom + ' ' + absence.professeur?.user?.prenom,
      Commentaire: absence.commentaire || 'Aucun'
    }));

    // Ici vous pouvez implémenter l'export CSV ou PDF
    console.log('Données à exporter:', data);
  }
}
