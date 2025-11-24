import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/utilisateur/user.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { AuthService } from '../../../../services/auth/auth.service';
 import { Classe } from '../../../../models/classe.model';
import { Matiere } from '../../../../models/matiere.model';
import { Eleve } from '../../../../models/eleve.model';
import { NotesService } from '../../../../services/note/notes.service';

interface NoteData {
  classe_id: number;
  eleve_id: number;
  matiere_id: number;
  type: string;
  valeur: number;
  periode: string;
  commentaire?: string;
}

@Component({
  selector: 'app-attribuer-note',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attribuer-note.component.html',
  styleUrls: ['./attribuer-note.component.scss']
})
export class AttribuerNoteComponent implements OnInit {
  noteForm!: FormGroup;
  isSubmitting = false;
  filteredEleves: Eleve[] = [];
  allEleves: Eleve[] = [];
  classes: Classe[] = [];
  matieres: Matiere[] = [];

  typesNote = [
    { value: 'devoir', label: 'Devoir Surveillé' },
    { value: 'examen', label: 'Examen' },
  ];

  periodes = [
    { value: 'trimestre1', label: 'Trimestre 1' },
    { value: 'trimestre2', label: 'Trimestre 2' },
    { value: 'trimestre3', label: 'Trimestre 3' }
  ];
profMatiere!: Matiere;

  constructor(
    private fb: FormBuilder,
    private referenceService: ReferenceService,
    private userService: UserService,
    private authService: AuthService,
    private notesService: NotesService // <-- Injection du service notes
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.chargerDonneesInitiales();
    this.getMatiereProf();
  }


  getClasses() {

  const specificId = this.authService.getSpecificId();
   console
if (!specificId) {
  console.error('specific_id non trouvé dans le token');
  return;
}

  // Charger seulement les classes du professeur connecté
 this.referenceService.getClassesDuProfesseur(specificId ?? 0).subscribe({
  next: (res: any) => {
    this.classes = res.classes;        // 👈 le tableau

    console.log('Classes chargées pour le professeur:', this.classes);
  },
  error: (err: any) => console.error('Erreur chargement classes', err)
});

}

getMatiereProf() {
  const specificId = this.authService.getSpecificId();
  if (!specificId) {
    console.error('specific_id non trouvé dans le token');
    return;
  }

  this.userService.getProfesseurs().subscribe({
    next: (res: any) => {
      const professeur = res.find((p: any) => p.id === specificId);

      if (!professeur) {
        console.error('Professeur non trouvé');
        return;
      }

      // Récupérer la matière du professeur
      this.profMatiere = professeur.matiere;
      console.log('Matière du professeur connecté:', this.profMatiere);

      // 👉 Pré-remplir le formulaire avec la matière du prof
      this.noteForm.patchValue({
        matiere_id: this.profMatiere.id
      });
    },

    error: (err: any) => {
      console.error("Erreur lors de la récupération du professeur :", err);
    }
  });
}

  chargerDonneesInitiales() {
    // Charger toutes les classes
    this.getClasses();

    // Charger tous les élèves
    this.userService.getElevesAvecMatricule().subscribe({
      next: (eleves: Eleve[]) => {
        this.allEleves = eleves;
        console.log('Élèves reçus du backend :', eleves);

        // Filtrer les élèves selon la classe sélectionnée
        const classeId = this.noteForm.value.classe_id;
        if (classeId) {
          this.filtrerElevesParClasse(classeId);
        }
      },
      error: (err: any) => console.error('Erreur chargement élèves', err)
    });

    // Charger toutes les matières
    this.referenceService.getMatieres().subscribe({
      next: (matieres: Matiere[]) => {
        this.matieres = matieres;
      },
      error: (err: any) => console.error('Erreur chargement matières', err)
    });
  }

  // Filtrer les élèves par classe (côté client)
  filtrerElevesParClasse(classeId: number) {
    if (!classeId) {
      this.filteredEleves = [];
      return;
    }

    // Filtrer les élèves par ID de classe
    this.filteredEleves = this.allEleves.filter(eleve =>
      eleve.classe_id === classeId
    );
  }

  initializeForm() {
    this.noteForm = this.fb.group({
      classe_id: ['', Validators.required],
      eleve_id: ['', Validators.required],
      matiere_id: ['', Validators.required],
      type: ['devoir', Validators.required],
      valeur: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(20),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      periode: ['trimestre1', Validators.required],
      commentaire: ['']
    });
  }

  onClasseChange(event: any) {
    let classeId: number;

    if (typeof event === 'number') {
      classeId = event;
    } else {
      const select = event.target as HTMLSelectElement;
      classeId = Number(select.value);
    }

    if (classeId) {
      this.filtrerElevesParClasse(classeId);
      // Réinitialiser la sélection d'élève quand la classe change
      this.noteForm.patchValue({ eleve_id: '' });
    } else {
      this.filteredEleves = [];
    }
  }

  get f() {
    return this.noteForm.controls;
  }

  getNoteColor(valeur: number): string {
    if (valeur >= 16) return 'excellent';
    if (valeur >= 14) return 'tres-bien';
    if (valeur >= 12) return 'bien';
    if (valeur >= 10) return 'moyen';
    return 'insuffisant';
  }

  getAppreciation(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Moyen';
    return 'Insuffisant';
  }

  onSubmit() {
    if (this.noteForm.valid) {
      this.isSubmitting = true;

      // Préparer les données pour l'API
      const noteData: NoteData = {
        classe_id: this.noteForm.value.classe_id,
        eleve_id: this.noteForm.value.eleve_id,
        matiere_id: this.noteForm.value.matiere_id,
        type: this.noteForm.value.type,
        valeur: parseFloat(this.noteForm.value.valeur),
        periode: this.noteForm.value.periode,
        commentaire: this.noteForm.value.commentaire || ''
      };

      // APPEL RÉEL AU SERVICE - REMPLACE LA SIMULATION
      this.notesService.attribuerNote(noteData).subscribe({
        next: (response: any) => this.gestionSucces(response),
        error: (error: any) => this.gestionErreur(error)
      });
    } else {
      this.marquerChampsCommeTouches();
    }
  }

  private gestionSucces(response: any) {
    this.isSubmitting = false;
    console.log('Note attribuée avec succès:', response);

    // Réinitialiser partiellement le formulaire (garder la classe)
    const classeId = this.noteForm.value.classe_id;
    this.noteForm.patchValue({
      eleve_id: '',
      matiere_id: '',
      valeur: '',
      commentaire: ''
    });

    // Recharger les élèves de la classe
    if (classeId) {
      this.filtrerElevesParClasse(classeId);
    }

    // Message de succès
    alert('Note attribuée avec succès !');
  }

  private gestionErreur(error: any) {
    this.isSubmitting = false;
    console.error('Erreur attribution note:', error);

    let messageErreur = 'Erreur lors de l\'attribution de la note';

    if (error.error?.message) {
      messageErreur += ': ' + error.error.message;
    } else if (error.message) {
      messageErreur += ': ' + error.message;
    } else if (error.status === 0) {
      messageErreur = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 400) {
      messageErreur = 'Données invalides. Vérifiez les informations saisies.';
    } else if (error.status === 500) {
      messageErreur = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    alert(messageErreur);
  }

  private marquerChampsCommeTouches() {
    Object.keys(this.noteForm.controls).forEach(key => {
      const control = this.noteForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onValeurChange(event: any) {
    // La mise à jour visuelle se fait automatiquement via le binding
  }

  reinitialiserFormulaire() {
    this.noteForm.reset({
      classe_id: '',
      eleve_id: '',
      matiere_id: '',
      type: 'devoir',
      valeur: '',
      periode: 'trimestre1',
      commentaire: ''
    });
    this.filteredEleves = [];
  }
}
