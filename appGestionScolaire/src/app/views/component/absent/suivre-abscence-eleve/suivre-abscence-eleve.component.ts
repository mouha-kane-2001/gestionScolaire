import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AbsenceService } from '../../../../services/absence/absence.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-suivre-abscence-eleve',
  imports: [CommonModule, FormsModule],
  templateUrl: './suivre-abscence-eleve.component.html',
  styleUrl: './suivre-abscence-eleve.component.scss'
})
export class SuivreAbscenceEleveComponent implements OnInit, OnDestroy {



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

  absences: any[] = [];
  absencesFiltrees: any[] = [];
  loading = false;

  // Informations de l'élève
  eleve: any = null;

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
    tauxAbsentisme: 0,
    parMatiere: [] as any[]
  };

  // Données pour les graphiques
  matieresUniques: string[] = [];
  motifsUniques: string[] = [];

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerAbsences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chargerAbsences(): void {
    this.loading = true;
    const eleveId = this.authService.getEleveId();

    if (eleveId) {
      this.absenceService.getAbsencesByEleve(eleveId)
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

            // Récupérer les infos de l'élève depuis la première absence
            if (this.absences.length > 0) {
              this.eleve = this.absences[0].eleve;
            }

            this.absencesFiltrees = [...this.absences];
            this.matieresUniques = this.getMatieresUniques();
            this.motifsUniques = this.getMotifsUniques();
            this.calculerStatistiques();
            this.loading = false;

            console.log('Absences chargées:', this.absences);
          },
          error: (err) => {
            console.error('Erreur lors du chargement des absences:', err);
            this.absences = [];
            this.absencesFiltrees = [];
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
      this.absences = [];
    }
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
      Math.round((this.stats.total / 30) * 100) : 0;

    // Statistiques par matière
    this.stats.parMatiere = this.getStatsParMatiere();
  }

  getStatsParMatiere(): any[] {
    const matieresMap = new Map();

    this.absencesFiltrees.forEach(absence => {
      const matiereNom = absence.matiere?.nom || 'Non spécifiée';

      if (!matieresMap.has(matiereNom)) {
        matieresMap.set(matiereNom, {
          nom: matiereNom,
          total: 0,
          justifiees: 0,
          nonJustifiees: 0
        });
      }

      const stats = matieresMap.get(matiereNom);
      stats.total++;

      if (absence.justifiee) {
        stats.justifiees++;
      } else {
        stats.nonJustifiees++;
      }
    });

    return Array.from(matieresMap.values());
  }

  // Export des données
  exporterAbsences(): void {
    const data = this.absencesFiltrees.map(absence => ({
      Date: absence.date_absence,
      Matière: absence.matiere?.nom,
      Motif: this.getMotifLabel(absence.motif),
      Statut: absence.justifiee ? 'Justifiée' : 'Non justifiée',
      Professeur: absence.professeur?.user?.nom + ' ' + absence.professeur?.user?.prenom,
      Commentaire: absence.commentaire || 'Aucun'
    }));

    // Implémentation de l'export CSV
    this.exportToCSV(data, `absences_${new Date().toISOString().split('T')[0]}.csv`);
  }

  private exportToCSV(data: any[], filename: string): void {
    const headers = ['Date', 'Matière', 'Motif', 'Statut', 'Professeur', 'Commentaire'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.Date,
        `"${row.Matière}"`,
        `"${row.Motif}"`,
        `"${row.Statut}"`,
        `"${row.Professeur}"`,
        `"${row.Commentaire}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Méthode pour obtenir la couleur selon le nombre d'absences
  getCouleurImportance(nombre: number): string {
    if (nombre >= 5) return 'text-danger';
    if (nombre >= 3) return 'text-warning';
    return 'text-success';
  }
}
