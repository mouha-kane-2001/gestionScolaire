import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { UserService } from '../../../../services/utilisateur/user.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { AbsenceService } from '../../../../services/absence/absence.service';
import { Eleve } from '../../../../models/eleve.model';
import { Classe } from '../../../../models/classe.model';

interface AbsenceData {
  eleve_id: number;
  classe_id: number;
  date_absence: string;
  motif: string;
  justifiee: boolean;
  commentaire?: string;
}

@Component({
  selector: 'app-marquer-absent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marquer-absent.component.html',
  styleUrls: ['./marquer-absent.component.scss']
})
export class MarquerAbsentComponent implements OnInit {



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




  
  absenceForm!: FormGroup;
  isSubmitting = false;
  filteredEleves: Eleve[] = [];
  allEleves: Eleve[] = [];
  classes: Classe[] = [];
  today: string;

  motifsAbsence = [
    { value: 'absent', label: 'Absent' },
    { value: 'retard', label: 'Retard' },
    { value: 'mauvaise_conduite', label: 'Mauvaise conduite' },
    { value: 'non_participation', label: 'Ne participe pas' },
    { value: 'non_travail', label: 'Ne fait pas les exercices' },
    { value: 'cours_manque', label: 'A manqué un autre cours' },
    { value: 'sans_billet', label: 'Sans billet d\'entrée' },
    { value: 'autre', label: 'Autre raison' }
  ];

  constructor(
    private fb: FormBuilder,
    private referenceService: ReferenceService,
    private userService: UserService,
    private authService: AuthService,
    private absenceService: AbsenceService
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.initializeForm();
    this.chargerDonneesInitiales();
  }

  initializeForm() {
    this.absenceForm = this.fb.group({
      classe_id: ['', Validators.required],
      eleve_id: ['', Validators.required],
      date_absence: [this.today, Validators.required],
      motif: ['absent', Validators.required],
      justifiee: [false],
      commentaire: ['']
    });
  }

  chargerDonneesInitiales() {
    // Charger toutes les classes
   const specificId = this.authService.getSpecificId();
   console
if (!specificId) {
  console.error('specific_id non trouvé dans le token');
  return;
}

  // Charger seulement les classes du professeur connecté

  // Charger seulement les classes du professeur connecté
 this.referenceService.getClassesDuProfesseur(specificId ?? 0).subscribe({
  next: (res: any) => {
    this.classes = res.classes;        // 👈 le tableau

    console.log('Classes chargées pour le professeur:', this.classes);
  },
  error: (err: any) => console.error('Erreur chargement classes', err)
});


    // Charger tous les élèves
    this.userService.getElevesAvecMatricule().subscribe({
      next: (eleves: Eleve[]) => {
        this.allEleves = eleves;
      },
      error: (err: any) => console.error('Erreur chargement élèves', err)
    });
  }

  onClasseChange(event: any) {
    const classeId = Number(event.target.value);

    if (classeId) {
      this.filtrerElevesParClasse(classeId);
      this.absenceForm.patchValue({ eleve_id: '' });
    } else {
      this.filteredEleves = [];
    }
  }

  filtrerElevesParClasse(classeId: number) {
    if (!classeId) {
      this.filteredEleves = [];
      return;
    }
    this.filteredEleves = this.allEleves.filter(eleve => eleve.classe_id === classeId);
  }

  get f() {
    return this.absenceForm.controls;
  }

  onSubmit() {
    if (this.absenceForm.valid) {
      this.isSubmitting = true;

      const absenceData: AbsenceData = {
        eleve_id: this.absenceForm.value.eleve_id,
        classe_id: this.absenceForm.value.classe_id,
        date_absence: this.absenceForm.value.date_absence,
        motif: this.absenceForm.value.motif,
        justifiee: this.absenceForm.value.justifiee,
        commentaire: this.absenceForm.value.commentaire || ''
      };

      this.absenceService.marquerAbsence(absenceData).subscribe({
        next: (response: any) => this.gestionSucces(response),
        error: (error: any) => this.gestionErreur(error)
      });
    } else {
      this.marquerChampsCommeTouches();
    }
  }

  private gestionSucces(response: any) {
    this.isSubmitting = false;

    const classeId = this.absenceForm.value.classe_id;
    this.absenceForm.patchValue({
      eleve_id: '',
      commentaire: ''
    });

    if (classeId) {
      this.filtrerElevesParClasse(classeId);
    }

    alert('Absence enregistrée avec succès !');
  }

  private gestionErreur(error: any) {
    this.isSubmitting = false;

    let messageErreur = 'Erreur lors de l\'enregistrement';
    if (error.error?.message) {
      messageErreur += ': ' + error.error.message;
    }

    alert(messageErreur);
  }

  private marquerChampsCommeTouches() {
    Object.keys(this.absenceForm.controls).forEach(key => {
      const control = this.absenceForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  marquerAbsenceRapide(eleve: Eleve, motif: string) {
    if (confirm(`Marquer ${eleve.prenom} ${eleve.nom} comme ${this.getMotifLabel(motif)} ?`)) {
      this.absenceForm.patchValue({
        eleve_id: eleve.id,
        classe_id: eleve.classe_id,
        motif: motif,
        justifiee: false
      });
      this.onSubmit();
    }
  }

  getMotifLabel(motifValue: string): string {
    const motif = this.motifsAbsence.find(m => m.value === motifValue);
    return motif ? motif.label : motifValue;
  }

  reinitialiserFormulaire() {
    this.absenceForm.reset({
      classe_id: '',
      eleve_id: '',
      date_absence: this.today,
      motif: 'absent',
      justifiee: false,
      commentaire: ''
    });
    this.filteredEleves = [];
  }
}
