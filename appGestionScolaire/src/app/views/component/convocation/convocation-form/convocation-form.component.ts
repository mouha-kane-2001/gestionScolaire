import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eleve } from '../../../../models/eleve.model';
import { Classe } from '../../../../models/classe.model';
import { UserService } from '../../../../services/utilisateur/user.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { ConvocationService } from '../../../../services/convocation/convocation.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-convocation-form',
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule
  ],
  templateUrl: './convocation-form.component.html',
  styleUrl: './convocation-form.component.scss'
})
export class ConvocationFormComponent {


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




convocationForm: FormGroup;
  eleves: Eleve[] = [];
  classes: Classe[] = [];
  filteredEleves: Eleve[] = [];
  adminId: number | null = null;

  typeDestinataire: 'parent' | 'classe' | 'tous_parents' = 'parent';
  classeFilter: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private referenceService: ReferenceService,
    private authService: AuthService,
    private convocationService: ConvocationService
  ) {
    this.convocationForm = this.fb.group({
      eleve_id: [''],
      classe_id: [''],
      objet: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      date_convocation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.adminId = this.authService.getSpecificId();
    this.getEleves();
    this.getClasses();
  }


  getEleves(): void {
    this.userService.getElevesAvecMatricule().subscribe({
      next: (data) => {
        this.eleves = data;
        this.filteredEleves = data;
      },

        error: (err) => {
    console.error('Erreur chargement élèves:', err);
    this.showAlertMessage('Erreur lors du chargement des élèves.','danger');
  }
});

  }

  getClasses(): void {
    this.referenceService.getClasses().subscribe({
      next: (classes: Classe[]) => {
        this.classes = classes;
      },
      error: (err: any) => console.error('Erreur chargement classes', err)
    });
  }

  onClasseFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const classeNom = target.value;
    this.filterElevesParClasse(classeNom);
  }

  filterElevesParClasse(classeNom?: string): void {
    if (!classeNom || classeNom === '') {
      this.filteredEleves = this.eleves;
      this.classeFilter = '';
      this.convocationForm.patchValue({ eleve_id: '' });
    } else {
      this.filteredEleves = this.eleves.filter(eleve =>
        eleve.classe.nom === classeNom
      );
      this.classeFilter = classeNom;
      this.convocationForm.patchValue({ eleve_id: '' });
    }
  }

  envoyerConvocation(): void {
    if (this.convocationForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.convocationForm.value;

    // Préparer les données de base
    const convocationData: any = {
      objet: formValue.objet,
      message: formValue.message,
      date_convocation: formValue.date_convocation,
      etat: 'non_lue',
      eleve_id:   null,
    };

    console.log('Convocation data:', convocationData);

    switch (this.typeDestinataire) {
      case 'parent':
        if (formValue.eleve_id) {
          this.envoyerConvocationParent(formValue.eleve_id, convocationData);
        } else {
              this.showAlertMessage('Veuillez sélectionner un élève', 'danger')
        }
        break;

      case 'classe':
        if (formValue.classe_id) {
          this.envoyerConvocationClasse(formValue.classe_id, convocationData);
        } else {

          this.showAlertMessage('Veuillez sélectionner une class', 'danger')
        }
        break;

      case 'tous_parents':
        this.envoyerConvocationTousParents(convocationData);
        break;
    }
  }

  private envoyerConvocationParent(eleveId: number, convocationData: any): void {
    const eleveIdNumber = typeof eleveId === 'string' ? parseInt(eleveId, 10) : eleveId;
    const eleve = this.eleves.find(e => e.id === eleveIdNumber);

    if (!eleve) {
      this.showAlertMessage(`Erreur: Élève non trouvé`, 'danger');

      return;
    }
    console.log('Élève trouvé:', eleve);
      // Le backend Laravel a confirmé que l'ID du parent est dans la propriété 'parent_id'
  const parentId = eleve.parent_id;


  if (!parentId) {
    this.showAlertMessage(`Erreur: Le parent de l'élève ${eleve.prenom} ${eleve.nom} n'est pas associé.`, 'danger');
    return;
  }
console.log('ID du parent:', parentId);
    const payload = {

      ...convocationData,
      eleve_id: eleveIdNumber,

      parent_id: parentId
    };

    this.convocationService.createConvocation(payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => {
        console.error('Erreur envoi convocation:', err);
        this.showAlertMessage('Erreur lors de l\'envoi de la convocation', 'danger');
      }
    });
  }

  private envoyerConvocationClasse(classeId: number, convocationData: any): void {
    console.log('les elevs envant lasse :', this.eleves);
    const classeIdNumber = Number(classeId); // convertir en nombre
const elevesClasse = this.eleves.filter(eleve =>
  eleve.classe && (eleve.classe.id === classeIdNumber || eleve.classe.nom === this.classeFilter)
);

    if (elevesClasse.length === 0) {
      this.showAlertMessage('Aucun élève trouvé dans cette classe', 'danger');
      return;
    }

    let envoisReussis = 0;
    let erreurs = 0;

    elevesClasse.forEach(eleve => {
      const payload = {
        ...convocationData,
        eleve_id: eleve.id,
        parent_id: eleve.parent_id
      };

      this.convocationService.createConvocation(payload).subscribe({
        next: () => {
          envoisReussis++;
          if (envoisReussis + erreurs === elevesClasse.length) {
            this.handleSuccessClasse(envoisReussis);
          }
        },
        error: (err) => {
          console.error('Erreur envoi convocation:', err);
          erreurs++;
          if (envoisReussis + erreurs === elevesClasse.length) {
            this.handleSuccessClasse(envoisReussis, erreurs);
          }
        }
      });
    });
  }

  private envoyerConvocationTousParents(convocationData: any): void {
    let envoisReussis = 0;
    let erreurs = 0;

    this.eleves.forEach(eleve => {
      const payload = {
        ...convocationData,
        parent_id: eleve.parent_id
      };

      this.convocationService.createConvocation(payload).subscribe({
        next: () => {
          envoisReussis++;
          if (envoisReussis + erreurs === this.eleves.length) {
            this.handleSuccessTous(envoisReussis);
          }
        },


        error: (err) => {
          console.error('Erreur envoi convocation:', err);
          erreurs++;
          if (envoisReussis + erreurs === this.eleves.length) {
            this.handleSuccessTous(envoisReussis, erreurs);
          }
        }
      });
    });
  }

  private handleSuccess(): void {
    this.convocationForm.reset();
    this.typeDestinataire = 'parent';
    this.classeFilter = '';
    this.filteredEleves = this.eleves;
    this.showAlertMessage('Convocation envoyée avec succès', 'success');
  }

  private handleSuccessClasse(succes: number, erreurs: number = 0): void {
    this.convocationForm.reset();
    this.typeDestinataire = 'parent';
    this.classeFilter = '';
    this.filteredEleves = this.eleves;

    if (erreurs > 0) {
      this.showAlertMessage(`Convocations envoyées: ${succes} réussies, ${erreurs} échecs`, 'danger');
    } else {
      this.showAlertMessage(`${succes} convocations envoyées avec succès à la classe`, 'success');
    }
  }

  private handleSuccessTous(succes: number, erreurs: number = 0): void {
    this.convocationForm.reset();
    this.typeDestinataire = 'parent';
    this.classeFilter = '';
    this.filteredEleves = this.eleves;

    if (erreurs > 0) {
      this.showAlertMessage(`Convocations envoyées: ${succes} réussies, ${erreurs} échecs`, 'danger');
    } else {
      this.showAlertMessage(`${succes} convocations envoyées à tous les parents`, 'success');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.convocationForm.controls).forEach(key => {
      this.convocationForm.get(key)?.markAsTouched();
    });
  }



  getObjetPlaceholder(): string {
    const placeholders = {
      'parent': 'Objet de la convocation...',
      'classe': 'Objet de la convocation pour la classe...',
      'tous_parents': 'Objet de la convocation générale...'
    };
    return placeholders[this.typeDestinataire];
  }

  getMessagePlaceholder(): string {
    const placeholders = {
      'parent': 'Message de convocation pour le parent...',
      'classe': 'Message de convocation pour les parents de la classe...',
      'tous_parents': 'Message de convocation pour tous les parents...'
    };
    return placeholders[this.typeDestinataire];
  }

  resetForm(): void {
    this.convocationForm.reset();
    this.typeDestinataire = 'parent';
    this.classeFilter = '';
    this.filteredEleves = this.eleves;
  }
}
