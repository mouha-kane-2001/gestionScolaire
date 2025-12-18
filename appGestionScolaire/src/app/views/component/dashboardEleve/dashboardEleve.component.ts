import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth/auth.service';
import { AbsenceService } from '../../../services/absence/absence.service';
import { MessageService } from '../../../services/messages/message.service';
import { NotesService } from '../../../services/note/notes.service';
import { Eleve } from '../../../models/eleve.model';
import { UserService } from '../../../services/utilisateur/user.service';
import { forkJoin } from 'rxjs';
import { ConvocationService } from '../../../services/convocation/convocation.service';

interface NoteRecent {
  matiere: string;
  type: string;
  date: string;
  valeur: number;
}

interface AbsenceRecent {
  date: string;
  motif: string;
  justifiee: boolean;
  matiere: string;
}

interface Matiere {
  nom: string;
  moyenne: number;
  evolution: number;
}

interface Message {
  id?: number;
  expediteur: string;
  message?: string;
  objet?: string;
  date: string;
  lu?: boolean;
}

interface Convocation {
  motif: string;
  date: string;
  professeur: string;
}

interface EleveStats {
  moyenneGenerale: number;
  presence: number;
  absencesTotal: number;
  convocations: number;
}

@Component({
  selector: 'app-dashboard-eleve',
  templateUrl: 'dashboardEleve.component.html',
  styleUrls: ['dashboardEleve.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    RowComponent,
     NgClass,
    DecimalPipe,

  ]
})
export class DashboardEleveComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private notesService: NotesService,
    private absenceService: AbsenceService,
    private messageService: MessageService,
    private userService: UserService,
      private convocationService: ConvocationService // <-- ajouté

  ) {}

  eleves: Eleve | null = null;
 userPrenom: string = '';
userNom: string = '';

  stats: EleveStats = {
    moyenneGenerale: 14.2, // reste fixe
    presence: 95,
    absencesTotal: 3,
    convocations: 1
  };

  notesRecentes: NoteRecent[] = [];
  absencesRecentes: AbsenceRecent[] = [];
  matieres: Matiere[] = [];
  messagesRecents: Message[] = [];
  convocationsRecentes: Convocation[] = [];

  ngOnInit(): void {
    this.loadEleveData();
    this.loadMessages();
    this.loadUserInfo();
  }
  // Nouvelle méthode pour charger les infos utilisateur
loadUserInfo(): void {
  const userInfo = this.authService.getUserInfo();

  if (userInfo.nomUtilisateur) {
    const nomComplet = userInfo.nomUtilisateur.split(' ');
    if (nomComplet.length >= 2) {
      this.userNom = nomComplet[0];
      this.userPrenom = nomComplet.slice(1).join(' ');
    } else {
      this.userNom = userInfo.nomUtilisateur;
      this.userPrenom = '';
    }
  } else {
    this.userPrenom = 'Parent';
    this.userNom = '';
  }
}



  loadEleveData(): void {
    const eleveId = this.authService.getSpecificId();

   if (!eleveId) return; // sécurité

  // 1. Charger les infos de l'élève
  this.userService.getUserById(eleveId).subscribe({
    next: (e) => {this.eleves = e
     },
    error: (err) => console.error(err)
  });
    // Notes récentes
    this.notesService.getNotesParEleve(eleveId!).subscribe({
  next: (notes: any[]) => {
    this.notesRecentes = notes.map(n => ({
      matiere: n.matiere.nom,      // <- prends juste le nom
      type: n.type,
      date: n.created_at,
      valeur: parseFloat(n.valeur) // <- converti en number
    }));

   },
  error: (err) => console.error(err)
});

    // Absences récentes
   this.absenceService.getAbsencesByEleve(eleveId!).subscribe({
  next: (absences: any[]) => {
    this.absencesRecentes = absences.map(a => ({
      date: a.date_absence,
      motif: a.motif,
      justifiee: !!a.justifiee,
      matiere: a.matiere ? a.matiere.nom : 'Non renseigné'
    }));

    // Convocations réelles
this.convocationService.getConvocationsByEleve(eleveId!).subscribe({
  next: (convos: any[]) => {
    this.convocationsRecentes = convos.map(c => ({
      motif: c.objet,                     // 'objet' du back devient 'motif'
      message: c.message,
      date: c.created_at,                 // 'created_at' devient 'date'
      professeur: c.professeur?.user
                    ? `${c.professeur.user.nom} ${c.professeur.user.prenom}`
                    : 'Non renseigné'
    }));
    this.stats.convocations = this.convocationsRecentes.length;
    console.log('Convocations transformées :', this.convocationsRecentes);
  },
  error: err => console.error('Erreur lors du chargement des convocations :', err)
});




    // Mettre à jour stats si nécessaire
    this.stats.absencesTotal = this.absencesRecentes.length;
    this.stats.presence = this.notesRecentes.length > 0
      ? 100 - (this.stats.absencesTotal / (this.stats.absencesTotal + this.notesRecentes.length)) * 100
      : 100;
  },
  error: (err) => console.error('Erreur absences :', err)
});


    // Convocations (mock ou API si existante)
    this.convocationsRecentes = [
      {
        motif: 'Rencontre parents-professeurs',
        date: new Date().toISOString(),
        professeur: 'Principal'
      }
    ];
    this.stats.convocations = this.convocationsRecentes.length;
  }

loadMessages(): void {
  const eleveId = this.authService.getSpecificId();

  this.messageService.getReceived(eleveId!).subscribe({
    next: (messages: any[]) => {
      this.userService.getAllUsers().subscribe(users => {
        this.messagesRecents = messages.map(m => {
          const expediteurObj = users.find(u => u.id === m.expediteur_id);

          let expediteurNom = `ID ${m.expediteur_id}`;
          if (expediteurObj) {
            // Vérifie si c'est un prof/admin avec champ user
            if (expediteurObj.user) {
              expediteurNom = `${expediteurObj.user.nom} ${expediteurObj.user.prenom}`;
            } else {
              // Sinon nom/prenom directement sur l'objet
              expediteurNom = `${expediteurObj.nom ?? ''} ${expediteurObj.prenom ?? ''}`.trim();
            }
          }

          return {
            id: m.id,
            expediteur: expediteurNom,
            objet: m.objet,
            message: m.contenu,
            date: m.created_at,
            lu: m.statut === 'lu'
          };
        });

      });
    },
    error: (err) => console.error('Erreur lors du chargement des messages :', err)
  });
}



  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getNoteBadgeClass(note: number): string {
    if (note >= 16) return 'bg-success';
    if (note >= 14) return 'bg-primary';
    if (note >= 12) return 'bg-info';
    if (note >= 10) return 'bg-warning';
    return 'bg-danger';
  }

  getAbsenceBadgeClass(justifiee: boolean): string {
    return justifiee ? 'bg-warning' : 'bg-danger';
  }

  getAbsenceText(justifiee: boolean): string {
    return justifiee ? 'Justifiée' : 'Non justifiée';
  }

  getNoteColor(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 14) return 'text-primary';
    if (note >= 12) return 'text-info';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

getInitials(prenom?: string, nom?: string): string {
  if (!prenom && !nom) return 'EL';
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
}


}
