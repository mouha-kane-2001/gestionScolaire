import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../../../services/note/notes.service';

@Component({
  selector: 'app-enfant-consultenotes',
  templateUrl: './enfant-consultenotes.component.html',
  styleUrls: ['./enfant-consultenotes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EnfantConsultenotesComponent implements OnInit {
  notes: any[] = [];
  notesFiltrees: any[] = [];
  loading = false;

  // Filtres
  filtreMatiere: string = '';
  filtreType: string = '';
  filtrePeriode: string = '';

  // Listes uniques pour les filtres
  matieresUniques: string[] = [];
  periodesUniques: string[] = [];

  constructor(private noteService: NotesService) {}

  ngOnInit(): void {
    this.chargerNotes();
  }

  chargerNotes(): void {
    this.loading = true;
    const eleveId = Number(localStorage.getItem('eleve_id'));

    if (eleveId) {
      this.noteService.getNotesParEleve(eleveId).subscribe({
        next: (data: any) => {
          // Normalisation des données
          if (Array.isArray(data)) {
            this.notes = data;
          } else if (data && Array.isArray(data.notes)) {
            this.notes = data.notes;
          } else {
            this.notes = [];
          }

          this.initialiserFiltres();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des notes :', err);
          this.loading = false;
        }
      });
    }
  }

  initialiserFiltres(): void {
    this.notesFiltrees = [...this.notes];
    this.matieresUniques = this.getMatieresUniques();
    this.periodesUniques = this.getPeriodesUniques();
  }

  // Filtrage des notes
  filtrerNotes(): void {
    this.notesFiltrees = this.notes.filter(note => {
      const matchesMatiere = !this.filtreMatiere ||
        note.matiere?.nom === this.filtreMatiere;
      const matchesType = !this.filtreType || note.type === this.filtreType;
      const matchesPeriode = !this.filtrePeriode || note.periode === this.filtrePeriode;

      return matchesMatiere && matchesType && matchesPeriode;
    });
  }

  // Réinitialiser les filtres
  reinitialiserFiltres(): void {
    this.filtreMatiere = '';
    this.filtreType = '';
    this.filtrePeriode = '';
    this.filtrerNotes();
  }

  // Méthodes utilitaires
  getMatieresUniques(): string[] {
    return [...new Set(this.notes.map(note => note.matiere?.nom).filter(Boolean))];
  }

  getPeriodesUniques(): string[] {
    return [...new Set(this.notes.map(note => note.periode).filter(Boolean))];
  }

  getBadgeClass(type: string): string {
    return type === 'examen' ? 'badge bg-danger' : 'badge bg-primary';
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 14) return 'text-primary';
    if (note >= 12) return 'text-info';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

  getAppreciation(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Assez bien';
    if (note >= 8) return 'Insuffisant';
    return 'Très insuffisant';
  }

  getAppreciationClass(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 12) return 'text-primary';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

  getStatutClass(note: number): string {
    return note >= 10 ? 'bg-success' : 'bg-danger';
  }

  // Calculs statistiques
  calculerMoyenne(): number {
    if (this.notesFiltrees.length === 0) return 0;
    const total = this.notesFiltrees.reduce((sum, note) => sum + note.valeur, 0);
    return Math.round((total / this.notesFiltrees.length) * 100) / 100;
  }

  countNotesSup10(): number {
    return this.notesFiltrees.filter(note => note.valeur >= 10).length;
  }

  countNotesInf10(): number {
    return this.notesFiltrees.filter(note => note.valeur < 10).length;
  }

  getPourcentageReussite(): number {
    if (this.notesFiltrees.length === 0) return 0;
    return Math.round((this.countNotesSup10() / this.notesFiltrees.length) * 100);
  }
}
