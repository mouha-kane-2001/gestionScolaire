import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotesService } from '../../../../services/note/notes.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { UserService } from '../../../../services/utilisateur/user.service';

interface Classe {
  id: number;
  nom: string;
}

interface Matiere {
  id: number;
  nom: string;
}

interface EleveNote {
  id: number;
  nom_complet: string;
  matricule: string;
  note_existante?: {
    id: number;
    valeur: number;
    type: string;
    periode: string;
    commentaire?: string;
    numero?: number;
    date?: string;
  };
}

@Component({
  selector: 'app-prof-voir-note',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-voir-note.component.html',
  styleUrls: ['./prof-voir-note.component.scss']
})
export class ProfVoirNoteComponent implements OnInit {
  // Filtres
  selectedClasseId?: number;
  selectedMatiereId?: number;
  selectedType: string = 'devoir';
  selectedPeriode: string = 'trimestre1';
  selectedNumero?: number;

  // Données
  classes: Classe[] = [];
  matieres: Matiere[] = [];
  elevesAvecNotes: EleveNote[] = [];
  profMatiere?: Matiere;
  isLoading = false;

  // Options pour les filtres
  typesNote = [
    { value: 'devoir', label: 'Devoir Surveillé' },
    { value: 'examen', label: 'Examen' },
  ];

  periodes = [
    { value: 'trimestre1', label: 'Trimestre 1' },
    { value: 'trimestre2', label: 'Trimestre 2' },
  ];

  numerosDevoir = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(
    private notesService: NotesService,
    private referenceService: ReferenceService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerDonneesInitiales();
  }

  chargerDonneesInitiales() {
    const specificId = this.authService.getSpecificId();
    if (specificId) {
      // Charger les classes du professeur
      this.referenceService.getClassesDuProfesseur(specificId).subscribe({
        next: (res: any) => {
          this.classes = res.classes || [];
          console.log('Classes chargées:', this.classes);
        },
        error: (err: any) => console.error('Erreur chargement classes', err)
      });

      // Charger la matière du professeur
      this.chargerMatiereProf();
    }
  }

 chargerMatiereProf() {
  const specificId = this.authService.getSpecificId();
  if (!specificId) return;

  this.userService.getProfesseurs().subscribe({
    next: (res: any) => {
      const professeur = res.find((p: any) => p.id === specificId);
      if (professeur?.matiere) {
        this.profMatiere = professeur.matiere;
        this.selectedMatiereId = this.profMatiere?.id;
        // Ajouter la matière du prof dans le tableau matieres pour l'affichage
        this.matieres = [this.profMatiere!];
        console.log('Matière du prof chargée:', this.profMatiere);

        // Charger automatiquement les notes si une classe est déjà sélectionnée
        if (this.selectedClasseId) {
          this.chargerNotes();
        }
      }
    },
    error: (err: any) => console.error("Erreur récupération professeur:", err)
  });
}

  onFiltresChange() {
    if (this.selectedClasseId && this.selectedMatiereId) {
      this.chargerNotes();
    }
  }

 chargerNotes() {
  if (!this.selectedClasseId || !this.selectedMatiereId) return;

  this.isLoading = true;
  this.elevesAvecNotes = [];

  this.notesService.getElevesAvecNotes(
    this.selectedClasseId,
    this.selectedMatiereId,
    this.selectedType,
    this.selectedPeriode,
      this.selectedNumero

  ).subscribe({
    next: (res: any[]) => {

      this.elevesAvecNotes = res.map((item: any) => ({
        id: item.eleve?.id,
        nom_complet: `${item.eleve?.user?.nom || ''} ${item.eleve?.user?.prenom || ''}`.trim(),
        matricule: item.eleve?.matricule || '',
        note_existante: item.valeur ? {
          id: item.id,
          valeur: item.valeur,
          type: item.type,
          periode: item.periode,
          commentaire: item.commentaire,
          numero: item.numero,
          date: item.created_at
        } : undefined
      }));

      console.log('Élèves formatés:', this.elevesAvecNotes);
      this.isLoading = false;
    },

    error: (err: any) => {
      console.error('Erreur chargement notes élèves', err);
      this.elevesAvecNotes = [];
      this.isLoading = false;
    }
  });
}






modifierNotesEnMasse() {
  if (!this.selectedClasseId || !this.selectedMatiereId) {
    alert('Veuillez d\'abord sélectionner une classe et une matière');
    return;
  }

  // Préparer toutes les données des élèves
  const elevesAvecNotes = this.elevesAvecNotes.map(eleve => ({
    id: eleve.id,
    nom_complet: eleve.nom_complet,
    matricule: eleve.matricule,
    note_actuelle: eleve.note_existante?.valeur || null,
    commentaire_actuel: eleve.note_existante?.commentaire || '',
      note_id: eleve.note_existante?.id || null
  }));

  const navigationExtras = {
    state: {
      mode: 'modification_masse', // Mode modification en masse
      classe_id: this.selectedClasseId,
      matiere_id: this.selectedMatiereId,
      type: this.selectedType,
      periode: this.selectedPeriode,
      numero: this.selectedNumero,
      eleves: elevesAvecNotes,
      nombre_eleves: this.elevesAvecNotes.length,
      nombre_notes: this.getNombreNotes()
    }
  };

  this.router.navigate(['/prof/notes/saisiMasse'], navigationExtras);
}


  supprimerNote(noteId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.')) {
      return;
    }

    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        alert('Note supprimée avec succès');
        this.chargerNotes(); // Recharger les données
      },
      error: (err: any) => {
        console.error('Erreur suppression note', err);
        alert('Erreur lors de la suppression de la note');
      }
    });
  }

  getNoteColor(valeur: number): string {
    if (valeur === undefined || valeur === null) return 'non-notee';
    if (valeur >= 16) return 'excellent';
    if (valeur >= 14) return 'tres-bien';
    if (valeur >= 12) return 'bien';
    if (valeur >= 10) return 'moyen';
    return 'insuffisant';
  }

  getAppreciation(note: number): string {
    if (note === undefined || note === null) return 'Non noté';
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Moyen';
    return 'Insuffisant';
  }

  getColorClass(valeur: number): string {
    if (valeur >= 16) return 'bg-green-100 text-green-800';
    if (valeur >= 14) return 'bg-blue-100 text-blue-800';
    if (valeur >= 12) return 'bg-indigo-100 text-indigo-800';
    if (valeur >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  exporterNotes() {
    const classeNom = this.classes.find(c => c.id === this.selectedClasseId)?.nom || 'inconnue';
    const matiereNom = this.profMatiere?.nom || 'inconnue';

    const data = this.elevesAvecNotes.map(eleve => ({
      'Nom Complet': eleve.nom_complet,
      'Matricule': eleve.matricule,
      'Note': eleve.note_existante?.valeur || '',
      'Appréciation': this.getAppreciation(eleve.note_existante?.valeur || 0),
      'Type': this.selectedType === 'devoir' ? 'Devoir' : 'Examen',
      'Période': this.selectedPeriode === 'trimestre1' ? 'Trimestre 1' : 'Trimestre 2',
      'Numéro': this.selectedType === 'devoir' ? (this.selectedNumero || '') : '',
      'Date Attribution': eleve.note_existante ?
        new Date(eleve.note_existante.date || '').toLocaleDateString('fr-FR') : '',
      'Commentaire': eleve.note_existante?.commentaire || ''
    }));

    this.downloadCSV(data, `notes_${classeNom}_${matiereNom}.csv`.replace(/\s+/g, '_'));
  }

  private downloadCSV(data: any[], filename: string) {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Headers
    csvRows.push(headers.join(','));

    // Rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Échapper les guillemets et les virgules
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Ajoutez cette nouvelle méthode
getNombreNotes(): number {
  return this.elevesAvecNotes.filter(eleve => eleve.note_existante).length;
}
// Ajoutez cette méthode (facultatif - juste un alias)
getNoteColorClass(valeur: number): string {
  return this.getColorClass(valeur);
}
}
