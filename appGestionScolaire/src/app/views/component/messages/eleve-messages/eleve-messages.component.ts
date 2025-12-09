import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Message, MessageService } from '../../../../services/messages/message.service';
import { UserService } from '../../../../services/utilisateur/user.service';
import { AuthService } from '../../../../services/auth/auth.service';
 import { TruncatePipe } from '../../../../pipes/truncate.pipe';


interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  matiere: { nom: string; id: number };
  user_id: number;
  user: { nom: string; prenom: string };
}

 @Component({
  selector: 'app-eleve-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './eleve-messages.component.html',
  styleUrls: ['./eleve-messages.component.scss']
})
export class EleveMessagesComponent implements OnInit {


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





  messageForm: FormGroup;
  messagesRecus: Message[] = [];
  messagesEnvoyes: Message[] = [];
  professeurs: Professeur[] = [];
  filteredMessagesRecus: Message[] = [];
  filteredMessagesEnvoyes: Message[] = [];

  rechercheControl = new FormControl('');
  currentSection: 'composer' | 'recus' | 'envoyes' = 'composer';
  selectedMessage: Message | null = null;

  userId: number | null = null;
  eleveId: number | null = null;
  role_expediteur: string | null = null;
  unreadCount = 0;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      destinataire_type: ['prof', Validators.required],
      prof_id: ['', Validators.required],
      objet: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      contenu: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      priorite: ['normal']
    });
  }

  ngOnInit() {
    this.eleveId = this.authService.getSpecificId();
    const userInfo = this.authService.getUserInfo();
    this.userId = userInfo?.id;
    this.role_expediteur = userInfo?.typeUtilisateur;

    console.log('🟢 Élève ID:', this.eleveId);
    console.log('🟢 User ID:', this.userId);
    console.log('🟢 Rôle expéditeur:', this.role_expediteur);

    this.chargerProfesseurs();

    if (this.userId) {
      this.chargerMessages();
    } else {
      console.warn('⚠️ Aucun userId détecté, attente avant chargement...');
      setTimeout(() => {
        this.userId = this.authService.getUserInfo()?.id;
        if (this.userId) {
          this.chargerMessages();
        }
      }, 500);
    }

    this.rechercheControl.valueChanges.subscribe(recherche => {
      this.filtrerMessages(recherche || '');
    });
  }

  chargerProfesseurs() {
    this.userService.getProfesseurs().subscribe({
      next: (profs) => {
        this.professeurs = profs;
        console.log('Professeurs chargés:', this.professeurs);
      },
      error: (err) => {
        console.error('Erreur chargement professeurs:', err);
        // Données de secours
        this.professeurs = [
          {
            id: 1,
            nom: 'Dupont',
            prenom: 'Marie',
            matiere: { nom: 'Mathématiques', id: 1 },
            user_id: 101,
            user: { nom: 'Dupont', prenom: 'Marie' }
          },
          {
            id: 2,
            nom: 'Martin',
            prenom: 'Pierre',
            matiere: { nom: 'Français', id: 2 },
            user_id: 102,
            user: { nom: 'Martin', prenom: 'Pierre' }
          },
          {
            id: 3,
            nom: 'Bernard',
            prenom: 'Sophie',
            matiere: { nom: 'Histoire-Géographie', id: 3 },
            user_id: 103,
            user: { nom: 'Bernard', prenom: 'Sophie' }
          }
        ];
      }
    });
  }

  chargerMessages() {
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
  }

  getMessagesRecus(): void {
    if (!this.userId) return;

    this.messageService.getReceived(this.userId).subscribe({
      next: (data) => {
        this.messagesRecus = data;
        this.filteredMessagesRecus = data;
        this.unreadCount = data.filter(msg => msg.statut === 'non_lu').length;
        console.log('Messages reçus:', this.messagesRecus);
      },
      error: (err: any) => {
        console.error('Erreur chargement messages reçus:', err);
        // Données de secours réalistes
        this.messagesRecus = [
          {
            id: 1,
            expediteur_id: 101,
            expediteur_type: 'prof',
            destinataire_id: this.userId!,
            role_destinataire: 'eleve',
            objet: 'Devoir de mathématiques',
            contenu: 'N\'oubliez pas de rendre votre devoir sur les fonctions pour vendredi prochain. Les exercices 5 et 6 sont particulièrement importants pour la compréhension du chapitre.',
            created_at: '2024-01-15T10:30:00',
            statut: 'non_lu',
            type: 'message',
            priorite: 'normal'
          },
          {
            id: 2,
            expediteur_id: 102,
            expediteur_type: 'prof',
            destinataire_id: this.userId!,
            role_destinataire: 'eleve',
            objet: 'Correction dissertation',
            contenu: 'Votre dissertation sur Candide montre de bonnes idées mais nécessite plus de structure. Passons en revue les points à améliorer lors de notre prochain cours.',
            created_at: '2024-01-14T14:20:00',
            statut: 'lu',
            type: 'message',
            priorite: 'normal'
          }
        ];
        this.filteredMessagesRecus = this.messagesRecus;
        this.unreadCount = this.messagesRecus.filter(msg => msg.statut === 'non_lu').length;
      }
    });
  }

  getMessagesEnvoyes(): void {
    if (!this.userId) return;

    this.messageService.getSent(this.userId).subscribe({
      next: (data) => {
        this.messagesEnvoyes = data;
        this.filteredMessagesEnvoyes = data;
        console.log('Messages envoyés:', this.messagesEnvoyes);
      },
      error: (err: any) => {
        console.error('Erreur chargement messages envoyés:', err);
        // Données de secours réalistes
        this.messagesEnvoyes = [
          {
            id: 3,
            expediteur_id: this.userId!,
            expediteur_type: 'eleve',
            destinataire_id: 101,
            role_destinataire: 'prof',
            objet: 'Question sur l\'exercice 5',
            contenu: 'Bonjour Madame, je n\'arrive pas à résoudre l\'exercice 5 sur les dérivées. Pourriez-vous m\'expliquer la méthode à utiliser pour la question 2b ?',
            created_at: '2024-01-14T16:45:00',
            type: 'message',
            statut: 'lu',
            priorite: 'normal'
          },
          {
            id: 4,
            expediteur_id: this.userId!,
            expediteur_type: 'eleve',
            destinataire_id: 103,
            role_destinataire: 'prof',
            objet: 'Absence cours d\'histoire',
            contenu: 'Bonjour Monsieur, je serai absent jeudi prochain pour une visite médicale. Pourriez-vous me dire quels chapitres seront abordés ?',
            created_at: '2024-01-13T09:15:00',
            type: 'message',
            statut: 'non_lu',
            priorite: 'normal'
          }
        ];
        this.filteredMessagesEnvoyes = this.messagesEnvoyes;
      }
    });
  }

  filtrerMessages(term: string) {
    const termeMinuscule = term.toLowerCase();

    this.filteredMessagesRecus = this.messagesRecus.filter(msg =>
      msg.contenu.toLowerCase().includes(termeMinuscule) ||
      msg.objet.toLowerCase().includes(termeMinuscule) ||
      this.getNomProfesseur(msg.expediteur_id).toLowerCase().includes(termeMinuscule)
    );

    this.filteredMessagesEnvoyes = this.messagesEnvoyes.filter(msg =>
      msg.contenu.toLowerCase().includes(termeMinuscule) ||
      msg.objet.toLowerCase().includes(termeMinuscule)
     );
  }

  envoyerMessage() {
    if (this.messageForm.invalid || !this.userId) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.messageForm.value;
    const profId = +formValue.prof_id;
    const prof = this.professeurs.find(p => p.user_id === profId);

    if (!prof) {
      this.showAlertMessage('Veuillez sélectionner un professeur', 'danger');
      return;
    }

    const messageData: any = {
      expediteur_id: this.userId,
      role_expediteur: 'eleve',
      destinataire_id: prof.user_id,
      role_destinataire: 'prof',
      objet: formValue.objet,
      contenu: formValue.contenu,
      type: 'message',
      priorite: formValue.priorite || 'normal'
    };

    console.log('Envoi du message:', messageData);

    this.messageService.sendMessage(messageData).subscribe({
      next: () => {
        this.showAlertMessage('Message envoyé avec succès', 'success');
        this.messageForm.reset({
          destinataire_type: 'prof',
          priorite: 'normal'
        });
        this.getMessagesEnvoyes();
        this.currentSection = 'envoyes';
      },
      error: (err) => {
        console.error('Erreur envoi message:', err);
        this.showAlertMessage('Erreur lors de l\'envoi du message', 'danger');
      }
    });
  }

  marquerCommeLu(messageId: number) {
    this.messageService.markAsRead(messageId).subscribe({
      next: () => {
        this.getMessagesRecus();
      },
      error: (err) => {
        console.error('Erreur marquer comme lu:', err);
      }
    });
  }

  getNomProfesseur(profId: number): string {
    const prof = this.professeurs.find(p => p.user_id === profId);
    return prof ? `Prof. ${prof.prenom} ${prof.nom}` : 'Professeur inconnu';
  }

  getMatiereProfesseur(profId: number): string {
    const prof = this.professeurs.find(p => p.user_id === profId);
    return prof ? prof.matiere.nom : 'Matière inconnue';
  }

  getAvatarIcon(msg: Message): string {
    const types: { [key: string]: string } = {
      'prof': 'fas fa-chalkboard-teacher',
      'admin': 'fas fa-headset',
      'eleve': 'fas fa-user-graduate',
      'parent': 'fas fa-user'
    };
    return types[msg.expediteur_type || ''] || 'fas fa-user';
  }

  getSenderName(msg: Message): string {
    if (msg.expediteur_type === 'admin') {
      return 'Administration';
    } else if (msg.expediteur_type === 'prof') {
      const prof = this.professeurs.find(p => p.user_id === msg.expediteur_id);
      return prof ? `Prof. ${prof.prenom} ${prof.nom}` : `Professeur`;
    }
    return `Utilisateur ${msg.expediteur_id}`;
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    if (message.statut === 'non_lu') {
      this.marquerCommeLu(message.id!);
    }
  }

  repondreMessage(message: Message): void {
    this.currentSection = 'composer';
    const prefix = message.expediteur_type === 'admin' ? 'RE: Administration - ' : 'RE: ';
    this.messageForm.patchValue({
      destinataire_type: 'prof',
      prof_id: message.expediteur_type === 'prof' ? message.expediteur_id : '',
      objet: `${prefix}${message.objet}`,
      contenu: `\n\n--- Message original ---\n${message.contenu}`
    });
  }

  closeMessageModal(): void {
    this.selectedMessage = null;
  }

  markFormGroupTouched(): void {
    Object.keys(this.messageForm.controls).forEach(key => {
      this.messageForm.get(key)?.markAsTouched();
    });
  }



  // Méthodes pour la navigation entre sections
  showSection(section: 'composer' | 'recus' | 'envoyes'): void {
    this.currentSection = section;
  }

  // Méthode utilitaire pour le template
  getButtonText(): string {
    return 'Envoyer au professeur';
  }
  resetForm() {
  this.messageForm.reset({
    destinataire_type: 'prof',
    priorite: 'normal'
  });
}

get filteredMessages() {
  return this.currentSection === 'recus'
    ? this.filteredMessagesRecus
    : this.filteredMessagesEnvoyes;
}


filterMessages(event: any) {
  const value = event.target.value || '';
  this.filtrerMessages(value);
}
getTypeClass(msg: Message) {
  return {
    'type-message': msg.type === 'message',
    'type-urgent': msg.priorite === 'urgent'
  };
}

getTypeLabel(msg: Message) {
  return msg.type === 'message' ? 'Message' : 'Info';
}

getStatusClass(msg: Message) {
  return msg.statut === 'lu' ? 'statut-lu' : 'statut-non-lu';
}

getStatusLabel(msg: Message) {
  return msg.statut === 'lu' ? 'Lu' : 'Non lu';
}
 getRecipientName(msg: Message) {
  const id = msg.destinataire_id;

  if (!id) {
    return 'Destinataire inconnu';
  }

  if (msg.role_destinataire === 'prof') {
    return this.getNomProfesseur(id);
  }

  return `Utilisateur ${id}`;
}

 refreshMessages() {
  this.chargerMessages();
}


}
