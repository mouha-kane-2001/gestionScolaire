import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReferenceService } from '../../../services/reference/reference.service';
import { UserService } from '../../../services/utilisateur/user.service';


// Interfaces
interface Professeur {
  id: number;
  user: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: string;
  };
}

interface Classe {
  id: number;
  nom: string;
}

interface AffectationPayload {
  professeurId: number;
  classesIds: number[];
}

@Component({
  selector: 'app-prof-classe',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prof-classe.component.html',
  styleUrls: ['./prof-classe.component.scss'],
  standalone: true
})
export class ProfClasseComponent implements OnInit, OnDestroy {



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



  assignForm: FormGroup;
  professeurs: Professeur[] = [];
  classes: Classe[] = [];
  isSubmitting = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private referenceService: ReferenceService,
    private userService: UserService
  ) {
    this.assignForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      professeurId: ['', [Validators.required, Validators.min(1)]],
      classesIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    // Chargement parallèle des données
    Promise.all([
      this.loadProfesseurs(),
      this.loadClasses()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadProfesseurs(): Promise<void> {
    return new Promise((resolve) => {
      this.userService.getProfesseurs()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (professeurs) => {
            this.professeurs = professeurs;
            console.log( 'Professeurs chargés:', this.professeurs);
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des professeurs:', error);
            this.showAlertMessage('Impossible de charger la liste des professeurs','danger');
            resolve();
          }
        });
    });
  }

  private loadClasses(): Promise<void> {
    return new Promise((resolve) => {
      this.referenceService.getClasses()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (classes) => {
            this.classes = classes;
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des classes:', error);
            this.showAlertMessage('Impossible de charger la liste des classes',error);
            resolve();
          }
        });
    });
  }

  onSubmit(): void {
    if (this.assignForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const payload: AffectationPayload = this.assignForm.value;

    this.userService.affecterProfesseur(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error)
      });
  }

  private handleSuccess(): void {
    this.isSubmitting = false;
    this.showAlertMessage('Professeur affecté avec succès !','success');
    this.resetForm();
  }

  private handleError(error: any): void {
    this.isSubmitting = false;
    console.error('Erreur lors de l\'affectation:', error);
    this.showAlertMessage('Erreur lors de l\'affectation du professeur','danger');
  }

  private resetForm(): void {
    this.assignForm.reset({
      professeurId: '',
      classesIds: []
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.assignForm.controls).forEach(key => {
      const control = this.assignForm.get(key);
      control?.markAsTouched();
    });
  }




  // Getters pour le template
  get professeurId() {
    return this.assignForm.get('professeurId');
  }

  get classesIds() {
    return this.assignForm.get('classesIds');
  }

  // Ajoutez ces méthodes à votre composant
getClassName(classId: number): string {
  const classe = this.classes.find(c => c.id === classId);
  return classe ? classe.nom : '';
}

removeClass(classId: number): void {
  const currentClasses = this.classesIds?.value || [];
  const updatedClasses = currentClasses.filter((id: number) => id !== classId);
  this.classesIds?.setValue(updatedClasses);
  this.classesIds?.markAsTouched();
}





}
