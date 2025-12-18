import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { UserService } from '../../../../services/utilisateur/user.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { AbsenceService } from '../../../../services/absence/absence.service';
import { Eleve } from '../../../../models/eleve.model';
import { Classe } from '../../../../models/classe.model';

interface AbsenceData {
  eleve_id: number;
  date_absence: string;
  matiere_id: number;
  motif: string;
  professeur_id: number;
  justifiee: boolean;
  classe_id: number;
  commentaire?: string;
}

interface AbsenceMarquee {
  eleve_id: number;
  motif: string;
  justifiee: boolean;
  timestamp: Date;
  matiere_id: number;
}

@Component({
  selector: 'app-liste-presence-absent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-presence-absent.component.html',
  styleUrls: ['./liste-presence-absent.component.scss']
})
export class ListePresenceAbsentComponent implements OnInit {



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





  allEleves: Eleve[] = [];
  elevesFiltres: Eleve[] = [];
  classes: Classe[] = [];
  classeSelectionnee: number | null = null;
  today: string;
  matiereId: number = 1; // À adapter

  absencesMarquees: AbsenceMarquee[] = [];
  presentsMarques: number[] = [];
  loading: boolean = false;
  absencesEnCoursDeSauvegarde: number[] = []; // IDs des élèves en cours de sauvegarde

  motifsAbsence = [
    { value: 'absent', label: 'Absent', icon: 'bi-x', color: 'danger' },
    { value: 'retard', label: 'Retard', icon: 'bi-clock', color: 'warning' },
    { value: 'mauvaise_conduite', label: 'Mauvaise conduite', icon: 'bi-exclamation-triangle', color: 'secondary' },
    { value: 'non_participation', label: 'Ne participe pas', icon: 'bi-person-x', color: 'secondary' },
    { value: 'non_travail', label: 'Ne fait pas les exercices', icon: 'bi-journal-x', color: 'secondary' },
    { value: 'cours_manque', label: 'A manqué un autre cours', icon: 'bi-skip-forward', color: 'secondary' },
    { value: 'sans_billet', label: 'Sans billet d\'entrée', icon: 'bi-ticket-perforated', color: 'secondary' },
    { value: 'autre', label: 'Autre raison', icon: 'bi-chat-dots', color: 'secondary' }
  ];

  get autresMotifs() {
    return this.motifsAbsence.filter(m => !['absent', 'retard'].includes(m.value));
  }

  constructor(
    private referenceService: ReferenceService,
    private userService: UserService,
    private authService: AuthService,
    private absenceService: AbsenceService
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.chargerDonneesInitiales();
  }

chargerDonneesInitiales() {
  const specificId = this.authService.getSpecificId();

  if (!specificId) {
    console.error('specific_id non trouvé dans le token');
    return;
  }

  // CORRECTION : Supprimez le deuxième appel duplicate et gardez seulement celui-ci
  this.referenceService.getClassesDuProfesseur(specificId).subscribe({
    next: (res: any) => {
      console.log('Réponse API getClassesDuProfesseur :', res);
      this.classes = res.classes || [];

      // VÉRIFIEZ LA STRUCTURE DE LA RÉPONSE
      console.log('Structure complète de la réponse:', JSON.stringify(res, null, 2));

      // Correction pour s'adapter à différentes structures de réponse
      if (res.matiere && res.matiere.id) {
        this.matiereId = res.matiere.id;
      } else if (res.matiere_id) {
        this.matiereId = res.matiere_id;
      } else if (res.id_matiere) {
        this.matiereId = res.id_matiere;
      }
      console.log('Matière ID définie:', this.matiereId);

      this.userService.getElevesAvecMatricule().subscribe({
        next: (eleves: Eleve[]) => {
          this.allEleves = eleves;
          this.elevesFiltres = [];
          this.chargerAbsencesExistantes();
        },
        error: (err: any) => console.error('Erreur chargement élèves', err)
      });
    },
    error: (err: any) => console.error('Erreur chargement classes', err)
  });
}
  // NOUVEAU : Charger les absences déjà enregistrées en base
  chargerAbsencesExistantes() {
    const specificId = this.authService.getSpecificId();
    if (!specificId) return;

    this.absenceService.getAbsencesDuJour(this.today, this.matiereId).subscribe({
      next: (absences: any[]) => {
        this.absencesMarquees = absences.map(absence => ({
          eleve_id: absence.eleve_id,
          motif: absence.motif,
          justifiee: absence.justifiee,
          timestamp: new Date(absence.created_at),
          matiere_id: absence.matiere_id
        }));
        console.log('Absences chargées depuis la base:', this.absencesMarquees);
      },
      error: (err) => console.error('Erreur chargement absences', err)
    });
  }

  onClasseChange(event: any) {
    const classeId = event.target.value ? Number(event.target.value) : null;
    this.classeSelectionnee = classeId;

    if (classeId) {
      this.elevesFiltres = this.allEleves.filter(eleve => eleve.classe_id === classeId);
    } else {
      this.elevesFiltres = [];
    }
  }

  getNomClasse(classeId: number): string {
    const classe = this.classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'N/A';
  }

  // Vérifier si un élève est déjà absent
  estDejaAbsent(eleveId: number): boolean {
    return this.absencesMarquees.some(a =>
      a.eleve_id === eleveId &&
      a.matiere_id === this.matiereId
    );
  }

  // Vérifier si un élève est en cours de sauvegarde
  estEnCoursDeSauvegarde(eleveId: number): boolean {
    return this.absencesEnCoursDeSauvegarde.includes(eleveId);
  }

  estPresent(eleveId: number): boolean {
    return !this.estDejaAbsent(eleveId);
  }

  estAbsent(eleveId: number): boolean {
    return this.estDejaAbsent(eleveId);
  }

  estJustifie(eleveId: number): boolean {
    const absence = this.absencesMarquees.find(a =>
      a.eleve_id === eleveId &&
      a.matiere_id === this.matiereId
    );
    return absence ? absence.justifiee : false;
  }

  // Obtenir le motif d'absence
  getMotifAbsence(eleveId: number): string {
    const absence = this.absencesMarquees.find(a =>
      a.eleve_id === eleveId &&
      a.matiere_id === this.matiereId
    );
    if (!absence) return '';

    const motif = this.motifsAbsence.find(m => m.value === absence.motif);
    return motif ? motif.label : absence.motif;
  }

  marquerPresent(eleve: Eleve) {
    if (this.loading || this.estEnCoursDeSauvegarde(eleve.id)) return;

    this.absencesMarquees = this.absencesMarquees.filter(a =>
      !(a.eleve_id === eleve.id && a.matiere_id === this.matiereId)
    );

    if (!this.presentsMarques.includes(eleve.id)) {
      this.presentsMarques.push(eleve.id);
    }

    console.log(`${eleve.prenom} ${eleve.nom} marqué comme présent`);

    // Supprimer l'absence en base de données
    this.supprimerAbsence(eleve.id);
  }

  marquerAbsentRapide(eleve: Eleve, motif: string) {
    if (this.loading || this.estDejaAbsent(eleve.id) || this.estEnCoursDeSauvegarde(eleve.id)) {
      return;
    }

    this.presentsMarques = this.presentsMarques.filter(id => id !== eleve.id);

    this.absencesMarquees.push({
      eleve_id: eleve.id,
      motif: motif,
      justifiee: false,
      timestamp: new Date(),
      matiere_id: this.matiereId
    });

    const motifLabel = this.motifsAbsence.find(m => m.value === motif)?.label || motif;
    console.log(`${eleve.prenom} ${eleve.nom} marqué comme ${motifLabel}`);

    this.sauvegarderAbsence(eleve.id);
  }

  toggleJustifie(eleveId: number) {
    if (this.loading || this.estEnCoursDeSauvegarde(eleveId)) return;

    const absenceIndex = this.absencesMarquees.findIndex(a =>
      a.eleve_id === eleveId &&
      a.matiere_id === this.matiereId
    );

    if (absenceIndex >= 0) {
      this.absencesMarquees[absenceIndex].justifiee = !this.absencesMarquees[absenceIndex].justifiee;
      this.sauvegarderAbsence(eleveId);
    }
  }

  sauvegarderAbsence(eleveId: number) {
    // Ajouter à la liste des sauvegardes en cours
    this.absencesEnCoursDeSauvegarde.push(eleveId);

    const specificId = this.authService.getSpecificId();
    const absence = this.absencesMarquees.find(a =>
      a.eleve_id === eleveId &&
      a.matiere_id === this.matiereId
    );

    if (!specificId || !absence) {
      this.retirerDeSauvegarde(eleveId);
      return;
    }

    const eleve = this.allEleves.find(e => e.id === eleveId);
    if (!eleve) {
      this.retirerDeSauvegarde(eleveId);
      return;
    }

    const absenceData: AbsenceData = {
      eleve_id: absence.eleve_id,
      date_absence: this.today,
      matiere_id: this.matiereId,
      motif: absence.motif,
      professeur_id: specificId,
      justifiee: absence.justifiee,
      classe_id: this.classeSelectionnee!,
      commentaire: absence.justifiee ? 'Absence justifiée' : 'Absence non justifiée'
    };

    this.absenceService.marquerAbsence(absenceData).subscribe({
      next: (response: any) => {
        console.log('Absence traitée:', response);
        this.retirerDeSauvegarde(eleveId);

        // Recharger les absences pour synchroniser
        this.chargerAbsencesExistantes();
      },
      error: (error) => {
        console.error('Erreur enregistrement API:', error);
        this.retirerDeSauvegarde(eleveId);
      }
    });
  }

  // NOUVEAU : Supprimer une absence
  supprimerAbsence(eleveId: number) {
    this.absencesEnCoursDeSauvegarde.push(eleveId);

    const specificId = this.authService.getSpecificId();
    if (!specificId) {
      this.retirerDeSauvegarde(eleveId);
      return;
    }

    this.absenceService.supprimerAbsence(eleveId, this.today, this.matiereId).subscribe({
      next: (response: any) => {
        console.log('Absence supprimée:', response);
        this.retirerDeSauvegarde(eleveId);
        this.chargerAbsencesExistantes();
      },
      error: (error) => {
        console.error('Erreur suppression absence:', error);
        this.retirerDeSauvegarde(eleveId);
      }
    });
  }

  // NOUVEAU : Retirer un élève de la liste des sauvegardes en cours
  retirerDeSauvegarde(eleveId: number) {
    this.absencesEnCoursDeSauvegarde = this.absencesEnCoursDeSauvegarde.filter(id => id !== eleveId);
  }

  marquerTousPresents() {
    if (this.loading) return;

    this.elevesFiltres.forEach(eleve => {
      if (this.estAbsent(eleve.id) && !this.estEnCoursDeSauvegarde(eleve.id)) {
        this.marquerPresent(eleve);
      }
    });
  }

  reinitialiserTout() {
    this.presentsMarques = [];
    this.absencesMarquees = [];
    this.classeSelectionnee = null;
    this.elevesFiltres = [];
    this.absencesEnCoursDeSauvegarde = [];
    console.log('Toutes les marques réinitialisées');
  }

  get countPresents(): number {
    return this.elevesFiltres.filter(e => this.estPresent(e.id)).length;
  }

  get countAbsents(): number {
    return this.elevesFiltres.filter(e => this.estAbsent(e.id)).length;
  }

  get countNonMarques(): number {
    return this.elevesFiltres.length - this.countPresents - this.countAbsents;
  }

  sauvegarderPresences() {
    console.log('Sauvegarde des présences...');
  }
}
 
