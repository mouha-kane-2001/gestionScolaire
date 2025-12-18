import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../../../services/note/notes.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../services/utilisateur/user.service';

interface EleveNote {
 id: number;
  nom_complet: string;
  matricule: string;
  note_actuelle?: number;
  note_id?: number;
}

interface Classe {
  id: number;
  nom: string;
}

interface Matiere {
  id: number;
  nom: string;
}

interface Stats {
  excellent: number;
  tresBien: number;
  bien: number;
  moyen: number;
  insuffisant: number;
  moyenne: number;
}

interface NumeroEvaluation {
  numero: number;
  estDisponible: boolean;
  existeDeja: boolean;
}

@Component({
  selector: 'app-bulk-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bulk-notes.component.html',
  styleUrls: ['./bulk-notes.component.scss']
})
export class BulkNotesComponent implements OnInit {
  bulkForm!: FormGroup;
  isSubmitting = false;
  classes: Classe[] = [];
  matieres: Matiere[] = [];
  eleves: EleveNote[] = [];
  selectedClasse?: Classe;
  profMatiere?: Matiere;
  numerosDisponibles: NumeroEvaluation[] = [];
  numerosCharges = false;

  // Ajoutez ces propriétés
  navigationData: any = null;
  preRemplissageEffectue = false;
  // Ajoutez cette propriété pour stocker temporairement les notes à pré-remplir
  notesAPreRemplir: EleveNote[] = [];

  stats: Stats = {
    excellent: 0,
    tresBien: 0,
    bien: 0,
    moyen: 0,
    insuffisant: 0,
    moyenne: 0
  };

  typesNote = [
    { value: 'devoir', label: 'Devoir Surveillé' },
    { value: 'examen', label: 'Examen' },
  ];

  periodes = [
    { value: 'trimestre1', label: 'Trimestre 1' },
    { value: 'trimestre2', label: 'Trimestre 2' },

  ];

    mode: 'attribution' | 'modification_masse' = 'attribution';

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private referenceService: ReferenceService,
    private authService: AuthService,
    private userService: UserService,
     private route: ActivatedRoute,
    private router: Router
  ) {}


  ngOnInit() {
    this.initializeForm();
    this.chargerDonneesInitiales();
    this.recupererDonneesNavigation();

    // Écouter les changements pour charger les numéros disponibles
    this.bulkForm.get('classe_id')?.valueChanges.subscribe(() => {
      this.chargerNumerosDisponibles();
      // Si nous avons des notes à pré-remplir et que la classe vient d'être changée, les appliquer
      if (this.notesAPreRemplir.length > 0) {
        setTimeout(() => this.appliquerNotesPreRemplies(), 100);
      }
    });



    this.bulkForm.get('matiere_id')?.valueChanges.subscribe(() => this.chargerNumerosDisponibles());
    this.bulkForm.get('type')?.valueChanges.subscribe(() => this.chargerNumerosDisponibles());
    this.bulkForm.get('periode')?.valueChanges.subscribe(() => this.chargerNumerosDisponibles());







  }







getMatiereProf() {
  const specificId = this.authService.getSpecificId();
  if (!specificId) return;

  this.userService.getProfesseurs().subscribe({
    next: (res: any) => {
      const professeur = res.find((p: any) => p.id === specificId);
      if (professeur?.matiere) {
        this.profMatiere = professeur.matiere;
        this.bulkForm.patchValue({ matiere_id: this.profMatiere?.id });
      }
    },
    error: (err: any) => console.error("Erreur récupération professeur:", err)
  });
}


  // Modifiez la méthode recupererDonneesNavigation
  recupererDonneesNavigation() {
    // Méthode 1: Via getCurrentNavigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.navigationData = navigation.extras.state;
      console.log('Données reçues via navigation:', this.navigationData);
      this.traiterDonneesNavigation();
    } else {
      // Méthode 2: Via ActivatedRoute (si navigation a déjà eu lieu)
      this.route.paramMap.subscribe(params => {
        // Vérifiez s'il y a des données dans l'état
        const state = history.state;
        if (state && state.classe_id) {
          this.navigationData = state;
          console.log('Données reçues via history.state:', this.navigationData);
          this.traiterDonneesNavigation();
        }
      });
    }
  }

 traiterDonneesNavigation() {
  if (!this.navigationData) return;

  // Déterminer le mode
  this.mode = this.navigationData.mode || 'attribution';

  // Stocker les notes à pré-remplir si en mode modification
  if (this.mode === 'modification_masse' && this.navigationData.eleves) {
    this.notesAPreRemplir = this.navigationData.eleves;
    console.log(`${this.notesAPreRemplir.length} notes à pré-remplir`);

    // EN MODE MODIFICATION : Utiliser directement les élèves de la navigation
    // sans attendre le chargement de allEleves
    this.utiliserElevesDeLaNavigation();
  }

  // Pré-remplir les filtres
  if (this.navigationData.classe_id) {
    // Attendre que le formulaire soit initialisé
    setTimeout(() => {
      this.preRemplirFiltres();
    }, 100);
  }
}

// Nouvelle méthode pour utiliser les élèves de la navigation
utiliserElevesDeLaNavigation() {
  console.log('Utilisation des élèves de la navigation');

  // Créer directement les élèves à partir des données de navigation
  this.eleves = this.notesAPreRemplir.map((eleve: any) => ({
    id: eleve.id,
    nom_complet: eleve.nom_complet,
    matricule: eleve.matricule,
    // Pour la compatibilité avec onClasseChange
    classe_id: this.navigationData.classe_id
  }));

  console.log(`${this.eleves.length} élèves créés depuis la navigation`, this.eleves);

  // Initialiser les contrôles immédiatement
  this.initialiserControlesNotes();

  // Appliquer les notes immédiatement
  this.appliquerNotesDirectement();
}

// Méthode pour appliquer les notes directement (sans timeout)
appliquerNotesDirectement() {
  console.log('Application directe des notes');

  let notesAppliquees = 0;

  this.notesAPreRemplir.forEach(eleveData => {
    const controlName = `note_${eleveData.id}`;
    const control = this.bulkForm.get(controlName);

    if (control && eleveData.note_actuelle !== null && eleveData.note_actuelle !== undefined) {
      control.setValue(eleveData.note_actuelle);
      notesAppliquees++;
      console.log(`Note appliquée directement pour élève ${eleveData.id}: ${eleveData.note_actuelle}`);
    }
  });

  console.log(`${notesAppliquees} notes appliquées directement`);
  this.calculerStatistiques();
}

  preRemplirFiltres() {
    if (!this.navigationData || this.preRemplissageEffectue) return;

    console.log('Pré-remplissage des filtres avec:', this.navigationData);

    // Pré-remplir les champs de base
    this.bulkForm.patchValue({
      classe_id: this.navigationData.classe_id || '',
      matiere_id: this.navigationData.matiere_id || '',
      type: this.navigationData.type || 'devoir',
      periode: this.navigationData.periode || 'trimestre1',
      numero: this.navigationData.numero || '',
      commentaire: this.navigationData.commentaire || ''
    });

    // NE PAS charger les notes ici - elles seront chargées quand la classe changera
    this.preRemplissageEffectue = true;
  }

  // Modifiez la méthode onClasseChange
  onClasseChange(event: any) {
    let classeId: number;

    if (typeof event === 'number') {
      classeId = event;
    } else if (event && event.target) {
      const select = event.target as HTMLSelectElement;
      classeId = Number(select.value);
    } else if (typeof event === 'string' || typeof event === 'number') {
      classeId = Number(event);
    } else {
      console.log('Événement non reconnu:', event);
      return;
    }

    console.log('Classe changée:', classeId);

    if (classeId) {
      this.selectedClasse = this.classes.find(c => c.id === classeId);
      this.eleves = this.allEleves.filter(eleve => eleve.classe_id === classeId);

      console.log(`${this.eleves.length} élèves trouvés pour la classe ${classeId}`);

      // Initialiser les contrôles de notes
      this.initialiserControlesNotes();

      // Appliquer les notes pré-remplies si disponibles
      if (this.notesAPreRemplir.length > 0) {
        setTimeout(() => this.appliquerNotesPreRemplies(), 50);
      }

      this.chargerNumerosDisponibles();
    } else {
      this.eleves = [];
      this.selectedClasse = undefined;
    }
  }

  // Nouvelle méthode pour appliquer les notes pré-remplies
 appliquerNotesPreRemplies() {
  console.log('Application des notes pré-remplies:', this.notesAPreRemplir.length);

  let notesAppliquees = 0;

  this.notesAPreRemplir.forEach(eleveData => {
    const controlName = `note_${eleveData.id}`;
    const control = this.bulkForm.get(controlName);

    if (control && eleveData.note_actuelle !== null && eleveData.note_actuelle !== undefined) {
      control.setValue(eleveData.note_actuelle);
      notesAppliquees++;
      console.log(`Note appliquée pour élève ${eleveData.id}: ${eleveData.note_actuelle}`);
    } else if (!control) {
      console.warn(`Contrôle non trouvé pour élève ${eleveData.id} - il n'est peut-être pas dans cette classe`);
    }
  });

  console.log(`${notesAppliquees} notes appliquées sur ${this.notesAPreRemplir.length} élèves`);

  // NE PAS VIDER LE TABLEAU - LAISSER LES DONNÉES POUR LA MISE À JOUR
  // this.notesAPreRemplir = [];

  // Recalculer les statistiques
  this.calculerStatistiques();
}

  // Modifiez la méthode initialiserControlesNotes
  initialiserControlesNotes() {
    // Supprimer tous les contrôles existants pour les notes
    Object.keys(this.bulkForm.controls).forEach(key => {
      if (key.startsWith('note_')) {
        this.bulkForm.removeControl(key);
      }
    });

    // Créer les contrôles pour chaque élève
    this.eleves.forEach(eleve => {
      const controlName = `note_${eleve.id}`;

      // Vérifier si cet élève a une note à pré-remplir
      const notePreRemplie = this.notesAPreRemplir.find(n => n.id === eleve.id);
      const valeurInitiale = notePreRemplie?.note_actuelle !== undefined ? notePreRemplie.note_actuelle : '';

      this.bulkForm.addControl(
        controlName,
        new FormControl(valeurInitiale, [
          Validators.required,
          Validators.min(0),
          Validators.max(20),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ])
      );

      // Écouter les changements pour recalculer les statistiques
      this.bulkForm.get(controlName)?.valueChanges.subscribe(() => {
        this.calculerStatistiques();
      });
    });

    console.log(`${this.eleves.length} contrôles de notes initialisés`);
  }




  chargerNotesExistantes(elevesAvecNotes: EleveNote[]) {
    console.log('Chargement des notes existantes pour', elevesAvecNotes.length, 'élèves');

    if (!elevesAvecNotes || elevesAvecNotes.length === 0) {
      console.log('Aucune donnée élève reçue');
      return;
    }

    // Vérifier que les contrôles existent
    setTimeout(() => {
      let notesChargees = 0;

      elevesAvecNotes.forEach(eleveData => {
        const controlName = `note_${eleveData.id}`;
        const control = this.bulkForm.get(controlName);

        if (control) {
          if (eleveData.note_actuelle !== null && eleveData.note_actuelle !== undefined) {
            control.setValue(eleveData.note_actuelle);
            notesChargees++;
            console.log(`Note chargée pour élève ${eleveData.id}: ${eleveData.note_actuelle}`);
          }
        } else {
          console.warn(`Contrôle non trouvé: ${controlName}`);
        }
      });

      console.log(`${notesChargees} notes chargées sur ${elevesAvecNotes.length} élèves`);

      // Recalculer les statistiques
      this.calculerStatistiques();
    }, 500);
  }


  initializeForm() {
    this.bulkForm = this.fb.group({
      classe_id: ['', Validators.required],
      matiere_id: ['', Validators.required],
      type: ['devoir', Validators.required],
      periode: ['trimestre1', Validators.required],
      numero: [''],
      commentaire: ['']
    });

    this.initialiserControlesNotes();
     // Écouter les changements pour mettre à jour la validation du numéro
  this.bulkForm.get('type')?.valueChanges.subscribe(type => {
    this.updateNumeroValidation(type);
  });
  }

  // Méthode pour mettre à jour la validation conditionnelle
updateNumeroValidation(type: string) {
  const numeroControl = this.bulkForm.get('numero');

  if (type === 'devoir') {
    // Pour les devoirs, le numéro est requis
    numeroControl?.setValidators([Validators.required]);
  } else {
    // Pour les examens, le numéro n'est pas requis et on le vide
    numeroControl?.clearValidators();
    numeroControl?.setValue(null);
  }

  // Mettre à jour la validation
  numeroControl?.updateValueAndValidity();
}

  allEleves: any[] = [];

  chargerDonneesInitiales() {
    const specificId = this.authService.getSpecificId();
    if (specificId) {
      this.referenceService.getClassesDuProfesseur(specificId).subscribe({
        next: (res: any) => {
          this.classes = res.classes || [];
        },
        error: (err: any) => console.error('Erreur chargement classes', err)
      });
    }

    this.userService.getElevesAvecMatricule().subscribe({
      next: (eleves: any[]) => {
        this.allEleves = eleves;
      },
      error: (err: any) => console.error('Erreur chargement élèves', err)
    });

    this.referenceService.getMatieres().subscribe({
      next: (matieres: Matiere[]) => {
        this.matieres = matieres;
      },
      error: (err: any) => console.error('Erreur chargement matières', err)
    });

    this.getMatiereProf();
  }


 chargerNumerosDisponibles() {
  const classeId = this.bulkForm.get('classe_id')?.value;
  const matiereId = this.bulkForm.get('matiere_id')?.value;
  const type = this.bulkForm.get('type')?.value;
  const periode = this.bulkForm.get('periode')?.value;

  // Si c'est un examen, pas besoin de numéro
  if (type === 'examen') {
    this.numerosDisponibles = [];
    this.numerosCharges = true;

    // Important: Appeler updateNumeroValidation pour s'assurer que la validation est correcte
    this.updateNumeroValidation(type);
    return;
  }

  // Pour les devoirs, simuler des données
  if (classeId && matiereId && type && periode) {
    // Simuler des numéros disponibles
    const numerosSimules: NumeroEvaluation[] = [
      { numero: 1, estDisponible: true, existeDeja: false },
      { numero: 2, estDisponible: true, existeDeja: true },
      { numero: 3, estDisponible: true, existeDeja: false },
    ];

    this.numerosDisponibles = numerosSimules;
    this.numerosCharges = true;

    // Sélectionner automatiquement le premier numéro disponible
    const premierDisponible = numerosSimules.find(n => n.estDisponible);
    if (premierDisponible) {
      this.bulkForm.patchValue({ numero: premierDisponible.numero });
    }

    console.log('Numéros disponibles chargés:', this.numerosDisponibles);
  } else {
    this.numerosDisponibles = [];
    this.numerosCharges = false;
  }
}



  // Ajoutez une méthode pour debuguer
  debugForm() {
    console.log('=== DEBUG FORM ===');
    console.log('Formulaire valide:', this.bulkForm.valid);
    console.log('Valeurs:', this.bulkForm.value);
    console.log('Élèves:', this.eleves);
    console.log('Contrôles notes:');

    this.eleves.forEach(eleve => {
      const control = this.bulkForm.get(`note_${eleve.id}`);
      console.log(`  note_${eleve.id}:`, control?.value);
    });

    console.log('Navigation data:', this.navigationData);
    console.log('Mode:', this.mode);
    console.log('=== FIN DEBUG ===');
  }




  calculerStatistiques() {
    let total = 0;
    let count = 0;
    const statsTemp = {
      excellent: 0,
      tresBien: 0,
      bien: 0,
      moyen: 0,
      insuffisant: 0
    };

    this.eleves.forEach(eleve => {
      const control = this.bulkForm.get(`note_${eleve.id}`);
      if (control && control.value !== '' && control.value !== null) {
        const note = parseFloat(control.value);
        if (!isNaN(note)) {
          total += note;
          count++;

          if (note >= 16) statsTemp.excellent++;
          else if (note >= 14) statsTemp.tresBien++;
          else if (note >= 12) statsTemp.bien++;
          else if (note >= 10) statsTemp.moyen++;
          else statsTemp.insuffisant++;
        }
      }
    });

    this.stats = {
      ...statsTemp,
      moyenne: count > 0 ? Math.round((total / count) * 100) / 100 : 0
    };
  }

  getNoteColor(valeur: number): string {
    if (!valeur && valeur !== 0) return '';
    if (valeur >= 16) return 'excellent';
    if (valeur >= 14) return 'tres-bien';
    if (valeur >= 12) return 'bien';
    if (valeur >= 10) return 'moyen';
    return 'insuffisant';
  }

  getAppreciation(note: number): string {
    if (!note && note !== 0) return '';
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Moyen';
    return 'Insuffisant';
  }

  setSameNoteForAll() {
    const sameNote = prompt('Entrez la même note pour tous les élèves (0-20):', '10');
    if (sameNote && !isNaN(parseFloat(sameNote))) {
      const note = parseFloat(sameNote);
      if (note >= 0 && note <= 20) {
        this.eleves.forEach(eleve => {
          this.bulkForm.get(`note_${eleve.id}`)?.setValue(note);
        });
        this.calculerStatistiques();
      } else {
        alert('La note doit être entre 0 et 20');
      }
    }
  }

  clearAllNotes() {
    if (confirm('Effacer toutes les notes saisies ?')) {
      this.eleves.forEach(eleve => {
        this.bulkForm.get(`note_${eleve.id}`)?.setValue('');
      });
      this.calculerStatistiques();
    }
  }

  getNombreNotesValides(): number {
    let count = 0;
    this.eleves.forEach(eleve => {
      const control = this.bulkForm.get(`note_${eleve.id}`);
      if (control && control.valid && control.value !== '' && control.value !== null) {
        count++;
      }
    });
    return count;
  }
/*
  onSubmit() {
  if (this.bulkForm.valid && this.getNombreNotesValides() > 0) {
    this.isSubmitting = true;

    const formData = this.bulkForm.value;

    // Créer un tableau d'objets avec eleve_id et valeur (format attendu par NoteRequest)
    const notesArray: Array<{ eleve_id: number; valeur: number }> = [];

    this.eleves.forEach((eleve) => {
      const noteValue = this.bulkForm.get(`note_${eleve.id}`)?.value;
      if (noteValue && noteValue !== '') {
        notesArray.push({
          eleve_id: eleve.id,  // IMPORTANT: "eleve_id" (avec underscore)
          valeur: parseFloat(noteValue)
        });
      }
    });

    const bulkData: any = {
      classe_id: parseInt(formData.classe_id),
      matiere_id: parseInt(formData.matiere_id),
      type: formData.type,
      periode: formData.periode,
      commentaire: formData.commentaire || '',
      notes: notesArray // Format tableau d'objets
    };

    // Ajouter le numéro seulement pour les devoirs
    if (formData.type === 'devoir' && formData.numero) {
      bulkData.numero = parseInt(formData.numero);
    }

    console.log('=== FORMAT CORRECT (tableau d\'objets) ===');
    console.log('BulkData:', JSON.stringify(bulkData, null, 2));
    console.log('Notes array:', notesArray);
    console.log('=== FIN DONNÉES ===');

    this.notesService.attribuerNotesBulk(bulkData).subscribe({
      next: (response: any) => {
        console.log('Notes en masse', response);
        this.isSubmitting = false;
        alert(`✅ ${response.notes_attribuees} notes attribuées avec succès !`);
        this.reinitialiserNotes();
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Erreur attribution notes', error);
        console.log('Erreur détaillée:', error.error);

        let messageErreur = 'Erreur lors de l\'attribution des notes';
        if (error.error?.message) {
          messageErreur += ': ' + error.error.message;
        } else if (error.error?.errors) {
          const errors = error.error.errors;
          let errorDetails = '';
          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              errorDetails += `${key}: ${errors[key].join(', ')}\n`;
            }
          }
          messageErreur += ':\n' + errorDetails;
        }
        alert(messageErreur);
      }
    });

  } else {
    this.marquerChampsCommeTouches();
  }
}
  */

  previsualiserNotes() {
    const notesValides = this.getNombreNotesValides();
    if (notesValides > 0) {
      alert(`Prévisualisation - ${notesValides} notes valides prêtes à être attribuées`);
    } else {
      alert('Aucune note valide à prévisualiser');
    }
  }

  private marquerChampsCommeTouches() {
    Object.keys(this.bulkForm.controls).forEach(key => {
      const control = this.bulkForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private reinitialiserNotes() {
    this.eleves.forEach(eleve => {
      this.bulkForm.get(`note_${eleve.id}`)?.setValue('');
    });
    this.calculerStatistiques();
  }

  reinitialiserFormulaire() {
    this.bulkForm.reset({
      classe_id: '',
      matiere_id: this.profMatiere?.id || '',
      type: 'devoir',
      periode: 'trimestre1',
      numero: '',
      commentaire: ''
    });
    this.eleves = [];
    this.selectedClasse = undefined;
    this.numerosDisponibles = [];
    this.numerosCharges = false;
    this.stats = {
      excellent: 0,
      tresBien: 0,
      bien: 0,
      moyen: 0,
      insuffisant: 0,
      moyenne: 0
    };
  }

  get f() {
    return this.bulkForm.controls;
  }


















 onSubmit() {
   if (this.isSubmitting) {
    console.log('Déjà en cours de soumission, ignoré');
    return;
  }
  if (this.bulkForm.valid && this.getNombreNotesValides() > 0) {
    this.isSubmitting = true;

    const formData = this.bulkForm.value;
    const commentaire = formData.commentaire || '';

    console.log('=== MODE:', this.mode, '===');

    // MODE MODIFICATION : Mettre à jour les notes existantes
    if (this.mode === 'modification_masse') {
      this.mettreAJourNotesEnMasse(formData, commentaire);
    }
    // MODE ATTRIBUTION : Créer de nouvelles notes
    else {
      this.creerNouvellesNotes(formData, commentaire);
    }

  } else {
    this.marquerChampsCommeTouches();
  }
}

// Méthode pour mettre à jour les notes en masse
// Méthode pour mettre à jour les notes en masse - VERSION COMPLÈTE
mettreAJourNotesEnMasse(formData: any, commentaire: string) {
  console.log('=== MISE À JOUR EN MASSE ===');
  console.log('Données notesAPreRemplir:', this.notesAPreRemplir);
  console.log('Élèves dans le formulaire:', this.eleves);

  // Préparer les données pour la mise à jour en masse
  const notesPourMiseAJour: Array<{note_id: number, valeur: number, commentaire?: string}> = [];

  // Utiliser un Set pour éviter les doublons
  const elevesTraites = new Set<number>();

  this.eleves.forEach((eleve) => {
    // Éviter les doublons
    if (elevesTraites.has(eleve.id)) {
      console.log(`Élève ${eleve.id} déjà traité, ignoré`);
      return;
    }
    elevesTraites.add(eleve.id);

    const noteValue = this.bulkForm.get(`note_${eleve.id}`)?.value;

    // Ne traiter que les élèves avec une note valide
    if (noteValue !== null && noteValue !== '' && !isNaN(parseFloat(noteValue))) {
      const nouvelleNote = parseFloat(noteValue);

      // Chercher dans les données de navigation
      const noteExistante = this.notesAPreRemplir.find(n => n.id === eleve.id);

      console.log(`Élève ${eleve.id} - Données trouvées:`, noteExistante);

      if (noteExistante && noteExistante.note_id) {
  // Convertir la note actuelle en nombre
  let ancienneNote: number;

  if (typeof noteExistante.note_actuelle === 'string') {
    ancienneNote = parseFloat(noteExistante.note_actuelle) || 0;
  } else if (typeof noteExistante.note_actuelle === 'number') {
    ancienneNote = noteExistante.note_actuelle;
  } else {
    ancienneNote = 0;
  }

  // DEBUG: Voir les valeurs comparées
  console.log(`Élève ${eleve.id}:`, {
    id: eleve.id,
    note_id: noteExistante.note_id,
    ancienne: ancienneNote,
    nouvelle: nouvelleNote,
    diff: Math.abs(ancienneNote - nouvelleNote),
    noteAChangee: Math.abs(ancienneNote - nouvelleNote) > 0.01
  });

  // Vérifier si la note a changé (tolérance de 0.01)
  const noteAChangee = Math.abs(ancienneNote - nouvelleNote) > 0.01;

  if (noteAChangee) {
    notesPourMiseAJour.push({
      note_id: noteExistante.note_id,
      valeur: nouvelleNote,
      commentaire: commentaire || undefined
    });

    console.log(`✅ Note ${eleve.id} sera mise à jour: ${ancienneNote} → ${nouvelleNote}`);
  } else {
    console.log(`➡️ Note ${eleve.id} inchangée: ${ancienneNote}`);
  }
}else {
        console.warn(`❌ Aucune note_id trouvée pour l'élève ${eleve.id}`);
        console.warn(`Données disponibles:`, noteExistante);
      }
    } else {
      console.log(`⚠️ Note invalide pour l'élève ${eleve.id}:`, noteValue);
    }
  });

  console.log('Notes à mettre à jour:', notesPourMiseAJour);
  console.log('Nombre de notes à mettre à jour:', notesPourMiseAJour.length);

  if (notesPourMiseAJour.length === 0) {
    this.isSubmitting = false;
    alert('Aucune modification détectée. Les notes sont identiques.');
    return;
  }

  // CONFIRMATION FINALE
  if (!confirm(`Êtes-vous sûr de vouloir mettre à jour ${notesPourMiseAJour.length} note(s) ?`)) {
    this.isSubmitting = false;
    return;
  }

  // APPEL API POUR MISE À JOUR EN MASSE
  console.log('Envoi des données pour mise à jour:', notesPourMiseAJour);

  this.notesService.updateNotesBulk(notesPourMiseAJour).subscribe({
    next: (response: any) => {
      console.log('Réponse API mise à jour en masse:', response);
      this.isSubmitting = false;

      if (response.status === 'success') {
        alert(`✅ ${response.notes_modifiees || notesPourMiseAJour.length} notes modifiées avec succès !`);
        // Rediriger vers la page des notes
        this.router.navigate(['/prof/notes']);
      } else {
        alert('❌ Erreur lors de la mise à jour des notes');
        this.isSubmitting = false;
      }
    },
    error: (error: any) => {
      console.error('Erreur API mise à jour notes en masse', error);
      this.isSubmitting = false;

      let messageErreur = 'Erreur lors de la mise à jour des notes';
      if (error.error?.error) {
        messageErreur += ': ' + error.error.error;
      } else if (error.error?.message) {
        messageErreur += ': ' + error.error.message;
      } else if (error.status === 0) {
        messageErreur += ': Impossible de se connecter au serveur';
      }
      alert(messageErreur);
    },
    complete: () => {
      // Toujours réinitialiser isSubmitting
      this.isSubmitting = false;
      console.log('Mise à jour terminée');
    }
  });
}
// Méthode pour créer de nouvelles notes (mode attribution)
creerNouvellesNotes(formData: any, commentaire: string) {
  console.log('=== ATTRIBUTION DE NOUVELLES NOTES ===');

  const notesArray: Array<{ eleve_id: number; valeur: number }> = [];

  this.eleves.forEach((eleve) => {
    const noteValue = this.bulkForm.get(`note_${eleve.id}`)?.value;
    if (noteValue && noteValue !== '') {
      notesArray.push({
        eleve_id: eleve.id, // IMPORTANT: eleve_id (avec underscore)
        valeur: parseFloat(noteValue)
      });
    }
  });

  const bulkData: any = {
    classe_id: parseInt(formData.classe_id),
    matiere_id: parseInt(formData.matiere_id),
    type: formData.type,
    periode: formData.periode,
    commentaire: commentaire,
    notes: notesArray
  };

  // Ajouter le numéro seulement pour les devoirs
  if (formData.type === 'devoir' && formData.numero) {
    bulkData.numero = parseInt(formData.numero);
  }

  console.log('Données pour attribution:', bulkData);

  this.notesService.attribuerNotesBulk(bulkData).subscribe({
    next: (response: any) => {
      console.log('Notes en masse', response);
      this.isSubmitting = false;
      alert(`✅ ${response.notes_attribuees} notes attribuées avec succès !`);
      this.reinitialiserNotes();
    },
    error: (error: any) => {
      this.isSubmitting = false;
      console.error('Erreur attribution notes', error);

      let messageErreur = 'Erreur lors de l\'attribution des notes';
      if (error.error?.message) {
        messageErreur += ': ' + error.error.message;
      }
      alert(messageErreur);
    }
  });
}
}
