import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Message, MessageService } from '../../../../services/messages/message.service';
import { UserService } from '../../../../services/utilisateur/user.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { TruncatePipe } from '../../../../pipes/truncate.pipe';
import { Utilisateur } from '../../../../models/utilisateur.model';

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  matiere: {nom :String, id: number};
  user_id: number;
  user: {nom: string; prenom: string};
}

@Component({
  selector: 'app-parent-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './parent-messages.component.html',
  styleUrls: ['./parent-messages.component.scss']
})
export class ParentMessagesComponent implements OnInit {
  messageForm!: FormGroup;
  professeurs: Professeur[] = [];
  messagesRecus: Message[] = [];
  messagesEnvoyes: Message[] = [];
  filteredMessages: Message[] = [];
  selectedFiles: File[] = [];
  userId: number | null = null;
  role_expediteur: string | null = null;
  users: Utilisateur[] = [];
  priorite: string = 'normal';

  currentSection: 'composer' | 'recus' | 'envoyes' = 'composer';
    typeDestinataire:  'admin'|'prof' = 'admin';

  selectedMessage: Message | null = null;

  parentId: number | null = null;
  unreadCount = 0;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService
  ) {}

 ngOnInit(): void {
  this.parentId = this.authService.getSpecificId();

  const userInfo = this.authService.getUserInfo();
  this.userId = userInfo?.id;
  this.role_expediteur = userInfo?.typeUtilisateur;


  this.initForm();
  this.loadProfs();

  // ✅ Appelle les fonctions APRES avoir défini userId
  if (this.userId) {
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
  } else {
    console.warn('⚠️ Aucun userId détecté, attente avant chargement...');
    setTimeout(() => {
      this.userId = this.authService.getUserInfo()?.id;
      if (this.userId) {
        this.getMessagesRecus();
        this.getMessagesEnvoyes();
      }
    }, 500);
  }
  this.userService.getAllUsers().subscribe(users => {
    this.users = users;
   });
  this
}


  initForm(): void {
    this.messageForm = this.fb.group({
      destinataire_type: ['prof', Validators.required],
      prof_id: [''],
      categorie: [''],
      priorite: ['normal'],
      destinataire_id: [''],
      objet: ['', [Validators.required, Validators.minLength(3)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadProfs(): void {
    this.userService.getProfesseurs().subscribe({
      next: (profs) => {
        this.professeurs = profs;
       },
      error: (err) => {
        console.error('Erreur chargement professeurs:', err);
      }
    });
  }

  getMessagesRecus(): void {
    this.messageService.getReceived(this.userId ?? 0).subscribe({
      next: (data) => {
        this.messagesRecus = data;
        this.filteredMessages = data;
        this.unreadCount = data.filter(msg => msg.statut === 'non_lu').length;

      },
      error: (err: any) => console.error('Erreur chargement messages:', err)
    });
  }

  getMessagesEnvoyes(): void {
    this.messageService.getSent(this.userId ?? 0).subscribe({
      next: (data) =>{ this.messagesEnvoyes = data
       },

      error: (err: any) => console.error('Erreur chargement messages envoyés:', err)
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.parentId) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.messageForm.value;
    const destinataireType = formValue.destinataire_type;

    // Préparer les données de base
    const messageData: any = {
      expediteur_id: this.userId,
      role_expediteur: 'parent',
      objet: formValue.objet,
      contenu: formValue.contenu,
      type: 'message',
      priorite: formValue.priorite || 'normal',
      categorie: formValue.categorie || ''
    };


    // Adapter selon le type de destinataire
   if (destinataireType === 'prof') {
     const profId = +formValue.prof_id; // le + convertit en number
const prof = this.professeurs.find(p => p.user_id === profId); // ou p.id selon ce que tu veux

    if (!prof) {
      this.showNotification('Veuillez sélectionner un professeur', 'error');
      return;
    }

     messageData.destinataire_id = prof.user_id;
    messageData.role_destinataire = 'prof';
  }else if (destinataireType === 'admin') {
      // Pour l'admin, on utilise un ID spécifique ou le système le gère automatiquement
       messageData.role_destinataire = 'admin';
      messageData.categorie = formValue.categorie;
    }


    this.messageService.sendMessage(messageData).subscribe({
      next: () => {
        this.showNotification('Message envoyé avec succès', 'success');
        this.messageForm.reset({
          destinataire_type: 'prof',
          priorite: 'normal'
        });
        this.selectedFiles = [];
        this.getMessagesEnvoyes();
        this.currentSection = 'envoyes';
      },
      error: (err) => {
        console.error('Erreur envoi message:', err);
        this.showNotification('Erreur lors de l\'envoi du message', 'error');
      }
    });
  }

  // Méthodes utilitaires pour le template
  getButtonText(): string {
    const type = this.messageForm.get('destinataire_type')?.value;
    return type === 'admin' ? 'Envoyer à l\'administration' : 'Envoyer au professeur';
  }

  getAvatarIcon(msg: Message): string {
    const types: { [key: string]: string } = {
      'prof': 'fas fa-chalkboard-teacher',
      'admin': 'fas fa-headset',
      'parent': 'fas fa-user'
    };
    return types[msg.expediteur_type || ''] || 'fas fa-user';
  }

  getDestAvatarIcon(msg: Message): string {
    const types: { [key: string]: string } = {
      'prof': 'fas fa-chalkboard-teacher',
      'admin': 'fas fa-headset',
      'parent': 'fas fa-user'
    };
    return types[msg.role_destinataire || ''] || 'fas fa-user';
  }



  getExpediteurName(expediteurId: number): string {

  if (!this.users || this.users.length === 0) {
    return `Utilisateur ${expediteurId} (inconnu)`;
  }

  const user = this.users.find(u => u.id === expediteurId);

  if (!user) {
    return `Utilisateur ${expediteurId} (non trouvé)`;
  }

  switch (user.role) {
    case 'admin': return 'Administration';
    case 'prof': return `Mr ${user.prenom} ${user.nom}`;
    case 'parent': return `Parent : ${user.prenom} ${user.nom}`;
    case 'eleve': return `${user.prenom} ${user.nom}`;
    default: return `Utilisateur ${user.id}`;
  }
}



  getTypeClass(msg: Message): string {
    const classes: { [key: string]: string } = {
      'annonce': 'type-annonce',
      'urgence': 'type-urgence',
      'message': 'type-message'
    };
    return classes[msg.type] || 'type-message';
  }

 getTypeLabel(msg: Message): string {
  const labels: { [key: string]: string } = {
    message: 'Message',
    annonce: 'Annonce',
    urgence: 'Urgent',
    demande: 'Demande',
    technique: 'Technique'
  };
  return labels[msg.type] || 'Message';
}

  getStatusClass(msg: Message): string {
    return msg.statut === 'non_lu' ? 'status-unread' : 'status-read';
  }

  getStatusLabel(msg: Message): string {
    return msg.statut === 'non_lu' ? 'Non lu' : 'Lu';
  }

  // Méthodes d'interaction
  markFormGroupTouched(): void {
    Object.keys(this.messageForm.controls).forEach(key => {
      this.messageForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.messageForm.reset({
      destinataire_type: 'prof',
      priorite: 'normal'
    });
    this.selectedFiles = [];
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  refreshMessages(): void {
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
    this.showNotification('Messages actualisés', 'info');
  }

  marquerCommeLu(messageId: number): void {
    this.messageService.markAsRead(messageId).subscribe({
      next: () => {
        this.getMessagesRecus();
      },
      error: (err) => {
        console.error('Erreur marquer comme lu:', err);
      }
    });
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    if (message.statut === 'non_lu') {
      this.marquerCommeLu(message.id!);
    }
  }




repondreMessage(message: Message): void {
  console.log('=== FIN REPRISE MESSAGE ===');
  console.log("MESSAGE ENTIER :", message);
  console.log("EXPEDITEUR ROLE :", message.role_expediteur);

  this.currentSection = 'composer';

  // Réinitialiser le formulaire d'abord
  this.messageForm.reset({
    destinataire_type: 'prof',
    priorite: 'normal'
  });

  // Pré-remplir le formulaire
  this.messageForm.patchValue({
    objet: `RE: ${message.objet}`,
    contenu: `\n\n--- Message original ---\nDe: ${this.getExpediteurName(message.expediteur_id)}\n${message.contenu}`,
    type: 'message'
  });

  switch (message.role_expediteur) {
    case 'admin':
      this.messageForm.patchValue({
        destinataire_type: 'admin',
        destinataire_id: message.expediteur_id,
        priorite: 'normal',
        categorie: ''
      });
      console.log('✅ Réponse configurée pour ADMIN');
      break;

    case 'prof':
      this.messageForm.patchValue({
        destinataire_type: 'prof',
        destinataire_id: message.expediteur_id
      });

      // Trouver le professeur et pré-remplir prof_id
      const prof = this.professeurs.find(p => p.user_id === message.expediteur_id);
      if (prof) {
        this.messageForm.patchValue({
          prof_id: prof.user_id
        });
        console.log('✅ Réponse configurée pour PROF:', prof.user.prenom, prof.user.nom);
      } else {
        console.warn('❌ Professeur non trouvé dans la liste');
      }
      break;

    default:
      console.warn('⚠️ Rôle expéditeur non reconnu:', message.role_expediteur);
      this.messageForm.patchValue({
        destinataire_type: 'prof',
        destinataire_id: ''
      });
      this.showNotification('Destinataire non reconnu. Sélectionnez-le manuellement.', 'info');
      break;
  }

  console.log('Formulaire après réponse:', this.messageForm.value);
}



  filterMessages(event: any): void {
    const filter = event.target.value;

    switch (filter) {
      case 'unread':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.statut === 'non_lu');
        break;
      case 'prof':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.expediteur_type === 'prof');
        break;
      case 'admin':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.expediteur_type === 'admin');
        break;
      default:
        this.filteredMessages = this.messagesRecus;
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Implémentez votre système de notification

    alert(message);
  }

     closeMessageModal(): void {
  this.selectedMessage = null;
}



   getDestinataireInfo(msg: Message): string {
    console.log('Récupération info destinataire pour le message msg:', msg);
    console.log('Rôle destinataire:', msg.role_destinataire);
    if (msg.role_destinataire === 'admin') {
      console.log('Destinataire est l\'administration');
      return 'Administration';
    }
    if (msg.destinataire_id) {
      if (msg.role_destinataire === 'prof') {
        console.log('Destinataire est un professeur');
        const prof = this.professeurs.find(p => p.id === msg.destinataire_id);
        return prof ? `Mr   ${prof.user.nom}`: `Professeur ${msg.destinataire_id}`;
      }
    }
    return 'Destinataire inconu';
  }



  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      message: 'bg-secondary',
      annonce: 'bg-info',
      urgence: 'bg-danger',
      demande: 'bg-warning',
      technique: 'bg-primary'
    };
    return classes[type] || 'bg-secondary';
  }
  resendMessage(msg: any) {
  // Logique pour renvoyer le message
   // Implémentez votre logique de renvoi
}

}
