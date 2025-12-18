import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NotesService } from '../../../../services/note/notes.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { UserService } from '../../../../services/utilisateur/user.service';

@Component({
  selector: 'app-parent-consultenotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-consultenotes.component.html',
  styleUrls: ['./parent-consultenotes.component.scss']
})
export class ParentConsultenotesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  enfants: any[] = []; // Assurez-vous que c'est un tableau
  selectedEnfant: any = null;
  notes: any[] = []; // Assurez-vous que c'est un tableau
  notesFiltrees: any[] = [];
  matieresUniques: string[] = [];
  loading = {
    enfants: false,
    notes: false
  };

  // Filtres
  filtreMatiere: string = '';
  filtreType: string = '';

  constructor(
    private noteService: NotesService,
    private authService: AuthService,
    private userService: UserService
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
  console.log('Parent ID:', parentId);

  if (parentId) {
    this.userService.getEnfantsParParent(parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('📦 Réponse brute:', response);

          // CORRECTION ICI - Utilisez directement le tableau reçu
          if (Array.isArray(response)) {
            this.enfants = response;
          } else if (response && Array.isArray(response.enfants)) {
            this.enfants = response.enfants;
          } else if (response && typeof response === 'object') {
            // Si c'est un tableau d'objets avec d'autres propriétés
            this.enfants = Object.values(response);
          } else {
            this.enfants = [];
          }

          this.loading.enfants = false;
          console.log('👶 Enfants normalisés:', this.enfants);

          // DEBUG - Vérifiez les propriétés du premier enfant
          if (this.enfants.length > 0) {
            console.log('🔍 Propriétés du premier enfant:', Object.keys(this.enfants[0]));
            console.log('📝 Données du premier enfant:', this.enfants[0]);
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des enfants :', err);
          this.loading.enfants = false;
          this.chargerEnfantsFallback(parentId);
        }
      });
  } else {
    this.loading.enfants = false;
    this.enfants = [];
  }
}

  private chargerEnfantsFallback(parentId: number): void {
    this.noteService.getNotesParParent(parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (Array.isArray(data)) {
            this.enfants = data;
          } else if (data && Array.isArray(data.enfants)) {
            this.enfants = data.enfants;
          } else {
            this.enfants = [];
          }
          this.loading.enfants = false;
        },
        error: (err) => {
          console.error('Erreur fallback :', err);
          this.enfants = []; // Assurez-vous que c'est un tableau vide
          this.loading.enfants = false;
        }
      });
  }

  voirNotes(enfant: any): void {
    this.selectedEnfant = enfant;
    this.loading.notes = true;

    this.noteService.getNotesParEleve(enfant.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Gestion robuste de la réponse des notes
          if (Array.isArray(response)) {
            this.notes = response;
          } else if (response && Array.isArray(response.notes)) {
            this.notes = response.notes;
          } else if (response && typeof response === 'object') {
            this.notes = Object.keys(response).map(key => ({
              id: key,
              ...response[key]
            }));
          } else {
            this.notes = [];
          }

          this.notesFiltrees = [...this.notes];
          this.matieresUniques = this.getMatieresUniques();
          this.loading.notes = false;
          console.log('Notes chargées :', this.notes);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des notes :', err);
          this.notes = []; // Assurez un tableau vide en cas d'erreur
          this.notesFiltrees = [];
          this.loading.notes = false;
        }
      });
  }

  retour(): void {
    this.selectedEnfant = null;
    this.notes = [];
    this.notesFiltrees = [];
    this.filtreMatiere = '';
    this.filtreType = '';
  }

  // Filtrage des notes
  filtrerNotes(): void {
    this.notesFiltrees = this.notes.filter(note => {
      const matchesMatiere = !this.filtreMatiere ||
        note.matiere?.nom === this.filtreMatiere;
      const matchesType = !this.filtreType || note.type === this.filtreType;
      return matchesMatiere && matchesType;
    });
  }

  // Réinitialiser les filtres
  reinitialiserFiltres(): void {
    this.filtreMatiere = '';
    this.filtreType = '';
    this.filtrerNotes();
  }

  // Méthodes utilitaires
  getMatieresUniques(): string[] {
    return [...new Set(this.notes.map(note => note.matiere?.nom).filter(Boolean))];
  }

  getBadgeClass(type: string): string {
    return type === 'examen' ? 'badge bg-danger' : 'badge bg-primary';
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

  // Calculs statistiques avec arrondi
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
