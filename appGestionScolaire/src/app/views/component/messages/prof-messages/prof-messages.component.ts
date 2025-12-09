import { Component, OnInit } from '@angular/core'; // Import manquant ajouté
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Message, MessageService } from '../../../../services/messages/message.service';
import { Classe } from '../../../../models/classe.model';
import { TruncatePipe } from '../../../../pipes/truncate.pipe';
import { UserService } from '../../../../services/utilisateur/user.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { AuthService } from '../../../../services/auth/auth.service';

import { Eleve } from '../../../../models/eleve.model';




interface DemandeAdmin {
  id: number;
  objet: string;
  contenu: string;
  categorie: string;
  priorite: string;
  statut: string;
  created_at: string;
}

@Component({
  selector: 'app-prof-messages',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,TruncatePipe],
  templateUrl: './prof-messages.component.html',
  styleUrls: ['./prof-messages.component.scss']
})
export class ProfMessagesComponent implements OnInit {


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





  messagesRecus: Message[] = [];
  messagesEnvoyes: Message[] = [];
  filteredMessages: Message[] = [];
  demandesAdmin: DemandeAdmin[] = [];
  classes: Classe[] = [];
  eleves: Eleve[] = [];
  filteredEleves: Eleve[] = [];
classeFilter: string = '';
profId: number | null = null;
role_expediteur: string | null = null;
userId: number | null = null;

users: any[] = [];
// Méthode pour obtenir la classe CSS en fonction du type de message
getTypeClass(type: string): string {
  switch(type) {
    case 'message': return 'secondary';
    case 'annonce': return 'info';
    case 'urgence': return 'danger';
    default: return 'secondary';
  }
}
  getAvatarClass(expediteurType: string): string {
  switch(expediteurType) {
    case 'admin': return 'admin';
    case 'professeur': return 'prof';
    case 'parent': return 'parent';
    case 'eleve': return 'eleve';
    default: return 'admin';
  }
}

getAvatarIcon(expediteurType: string): string {
  switch(expediteurType) {
    case 'admin': return 'bi bi-person-gear';
    case 'professeur': return 'bi bi-person-check';
    case 'parent': return 'bi bi-person';
    case 'eleve': return 'bi bi-person';
    default: return 'bi bi-person';
  }
}
// Modifiez la méthode getEleves()
// Méthodes pour la section messages envoyés
getSuccessRate(): number {
  if (this.messagesEnvoyes.length === 0) return 0;
  // Logique pour calculer le taux de succès (ex: messages lus)
  const readMessages = this.messagesEnvoyes.filter(msg => this.isMessageRead(msg));
  return Math.round((readMessages.length / this.messagesEnvoyes.length) * 100);
}

getDestinataireCount(msg: any): number {
  // Logique pour obtenir le nombre de destinataires
  if (msg.destinataires && Array.isArray(msg.destinataires)) {
    return msg.destinataires.length;
  }
  return 1;
}

isMessageRead(msg: any): boolean {
  // Logique pour vérifier si le message a été lu
  // À adapter selon votre structure de données
  return msg.statut === 'lu' || msg.read_count > 0;
}

filterSentMessages(event: any): void {
  const filterValue = event.target.value;

  this.filteredMessages = this.messagesEnvoyes.filter(msg => {
    switch(filterValue) {
      case 'recent':
        return this.isRecentMessage(msg);
      case 'month':
        return this.isThisMonth(msg);
      case 'annonces':
        return msg.type === 'annonce';
      case 'urgent':
        return msg.type === 'urgence';
      default:
        return true;
    }
  });
}



isRecentMessage(msg: any): boolean {
  const messageDate = new Date(msg.created_at);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return messageDate >= weekAgo;
}

isThisMonth(msg: any): boolean {
  const messageDate = new Date(msg.created_at);
  const now = new Date();
  return messageDate.getMonth() === now.getMonth() &&
         messageDate.getFullYear() === now.getFullYear();
}

resendMessage(msg: any) {
  // Logique pour renvoyer le message
  console.log('Renvoyer le message:', msg);
  // Implémentez votre logique de renvoi
}

showMessageStats(msg: any) {
  // Logique pour afficher les statistiques du message
  console.log('Statistiques du message:', msg);
  // Implémentez votre logique d'affichage des stats
}
messageForm: FormGroup<any> = new FormGroup({});


  typeDestinataire: 'eleve' | 'classe' | 'admin' = 'eleve';
 // currentSection: 'composer' | 'recus' | 'envoyes'='envoyes' ;
currentSection: 'composer' | 'recus' | 'envoyes' = 'envoyes';

  selectedMessage: Message | null = null;
  priorite: string = 'normal';




  unreadCount = 0;

  // Statistiques
  demandesEnAttente = 0;
  demandesEnCours = 0;
  demandesResolues = 0;


  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
  private referenceService: ReferenceService,
  private authService: AuthService
  ) {}

 ngOnInit(): void {
  this.initForm();

  this.profId = this.authService.getSpecificId();
  const userInfo = this.authService.getUserInfo();
  this.userId = userInfo?.id;
  this.role_expediteur = this.authService.getUserInfo().typeUtilisateur;

  console.log('User ID:', this.userId);

  // 🔥 Maintenant tu peux charger les données :
  this.getMessagesRecus();
  this.getMessagesEnvoyes();
  this.getClasses();
  this.getEleves();
   this.calculerStatistiques();
   this.getUsers();
 }



 getUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Utilisateurs chargés:', this.users);
      },
      error: (err) => console.error('Erreur chargement utilisateurs:', err)
    });

 }
    // NOUVELLE MÉTHODE : Gère le changement du sélecteur de classe
  onClasseFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const classeNom = target.value; // La valeur est le nom de la classe (c.nom)
    this.filterElevesParClasse(classeNom);
  }



  initForm() {
    this.messageForm = this.fb.group({
      destinataire_id: [''],
      classe_id: [''],
      type: ['message', Validators.required],
      categorie: [''],
      objet: ['', [Validators.required, Validators.minLength(3)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getSectionTitle(): string {
    const titles = {
      'composer': 'Nouveau message',
      'recus': 'Boîte de réception',
      'envoyes': 'Messages envoyés',
     };
    return titles[this.currentSection];
  }

  getObjetPlaceholder(): string {
    if (this.typeDestinataire === 'admin') {
      return 'Objet de votre demande administrative...';
    }
    return 'Saisissez l\'objet de votre message...';
  }

  getContenuPlaceholder(): string {
    if (this.typeDestinataire === 'admin') {
      return 'Décrivez votre demande en détail...';
    }
    return 'Rédigez votre message ici...';
  }




  private handleSendSuccess() {
    const wasAdminMessage = this.typeDestinataire === 'admin'; // Sauvegarde avant reset

    this.messageForm.reset({ type: 'message' });
    this.typeDestinataire = 'eleve';
    this.priorite = 'normal';

    if (wasAdminMessage) {
       this.currentSection = 'recus';
    } else {
      this.getMessagesEnvoyes();
      this.currentSection = 'envoyes';
    }

    this.showAlertMessage(
      wasAdminMessage ? 'Demande envoyée avec succès' : 'Message envoyé avec succès',
      'success'
    );
  }



filterElevesParClasse(classeNom?: string) {


  if (!classeNom || classeNom === '') {
    this.filteredEleves = this.eleves;
    this.classeFilter = '';
    this.messageForm.patchValue({ destinataire_id: '' });
   } else {
    // Debug détaillé du filtre
    this.filteredEleves = this.eleves.filter(eleve => {
      const match = eleve.classe.nom === classeNom;
       return match;
    });

    this.classeFilter = classeNom;
    this.messageForm.patchValue({ destinataire_id: '' });
  }
}



// Modifiez la méthode pour envoyer à plusieurs parents
envoyerMessage() {
  if (this.messageForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  const formValue = this.messageForm.value;

  // Préparer les données de base
  const messageData: any = {
    expediteur_id: this.userId,
         role_expediteur: 'prof',
    objet: formValue.objet,
    contenu: formValue.contenu,
    type: formValue.type,
    priorite: this.priorite
  };

   console.log('Données du message préparées:', messageData);


  // Gérer les différents types d'envoi
  if (this.typeDestinataire === 'admin') {
    // Envoi à l'administration
    this.sendToAdmin(messageData);


  } else if (this.typeDestinataire === 'classe') {
    // Envoi à toute une classe
    this.sendToClasse(formValue.classe_id, messageData);

  } else if (this.typeDestinataire === 'eleve') {
    // NOUVELLE LOGIQUE : Envoi à un élève OU à un parent
    if (this.classeFilter && Array.isArray(formValue.destinataire_id)) {
      // Envoi multiple à plusieurs élèves/parents d'une classe
      this.sendToMultipleDestinataires(formValue.destinataire_id, messageData);
    } else if (formValue.destinataire_id) {
      // Envoi à un seul destinataire (élève ou parent)
      this.sendToSingleDestinataire(formValue.destinataire_id, messageData);
    } else {
      this.showAlertMessage('Veuillez sélectionner un destinataire', 'danger');
      return;
    }
  }
}

// NOUVELLE MÉTHODE : Envoi à un seul destinataire (élève OU parent)
private sendToSingleDestinataire(destinataireId: number, messageData: any) {
  // Trouver l'élève sélectionné
  const eleve = this.eleves.find(e => e.id === destinataireId);

  if (!eleve) {
    this.showAlertMessage(`Erreur: Destinataire non trouvé`, 'danger');
    return;
  }

  // DÉCISION : Envoyer à l'élève OU au parent ?
  const envoyerAEleveDirectement = false; // Changez cette variable selon votre besoin

  let payload;

  if (envoyerAEleveDirectement) {
    // Option 1 : Envoyer directement à l'élève
    payload = {
      ...messageData,
      destinataire_id: eleve.id,
      role_destinataire: 'eleve'
    };
  } else {
    // Option 2 : Envoyer au parent (comportement actuel)
    if (!eleve.parent_id) {
      this.showAlertMessage(`Erreur: Le parent de l'élève ${eleve.prenom} ${eleve.nom} n'est pas associé.`, 'danger');
      return;
    }

    payload = {
      ...messageData,
      destinataire_id: eleve.parent?.user_id,
      role_destinataire: 'parent'
    };
  }


  this.messageService.sendMessage(payload).subscribe({
    next: () => this.handleSendSuccess(),
    error: (err) => {
      console.error('Erreur envoi message:', err);
      this.showAlertMessage('Erreur lors de l\'envoi du message', 'danger');
    }
  });
}

// MÉTHODE AMÉLIORÉE : Envoi à plusieurs destinataires
private sendToMultipleDestinataires(destinatairesIds: number[], messageData: any) {
  const requests = destinatairesIds.map(destinataireId => {
    const eleve = this.eleves.find(e => e.id === destinataireId);

    if (!eleve) {
      console.error(`Élève ${destinataireId} non trouvé`);
      return null;
    }

    // Même logique de décision que pour l'envoi simple
    const envoyerAEleveDirectement = false; // À configurer

    let payload;

    if (envoyerAEleveDirectement) {
      payload = {
        ...messageData,
        destinataire_id: eleve.id,
        role_destinataire: 'eleve'
      };
    } else {
      if (!eleve.parent_id) {
        console.error(`Parent non trouvé pour élève ${eleve.id}`);
        return null;
      }

      payload = {
        ...messageData,
        destinataire_id: eleve.parent?.user_id,
        role_destinataire: 'parent'
      };
    }

    return this.messageService.sendMessage(payload);
  }).filter(req => req !== null); // Filtrer les requêtes nulles

  if (requests.length === 0) {
    this.showAlertMessage('Aucun destinataire valide sélectionné', 'danger');
    return;
  }

  // Envoi parallèle
  Promise.all(requests.map(req => req!.toPromise()))
    .then(() => {
      this.handleSendSuccess();
      this.showAlertMessage(`Message envoyé à ${requests.length} destinataire(s)`, 'success');
    })
    .catch(err => {
      console.error('Erreur envoi messages multiples:', err);
      this.showAlertMessage('Erreur lors de l\'envoi des messages', 'danger');
    });
}

// MÉTHODE AMÉLIORÉE : Envoi à une classe
private sendToClasse(classeId: number, messageData: any) {
  const payload = {
    ...messageData,
    classe_id: classeId,
    destinataire_id: null,
    role_destinataire: 'eleve' // Ou 'parent' selon votre choix
  };

  console.log('Envoi classe payload:', payload);

  this.messageService.sendMessage(payload).subscribe({
    next: () => {
      this.handleSendSuccess();
      this.showAlertMessage('Message envoyé à toute la classe', 'success');
    },
    error: (err) => {
      console.error('Erreur envoi classe:', err);
      this.showAlertMessage('Erreur lors de l\'envoi à la classe', 'danger');
    }
  });
}

// MÉTHODE AMÉLIORÉE : Envoi à l'admin
private sendToAdmin(messageData: any) {
  const payload = {
    ...messageData,
    destinataire_id: null,
    role_destinataire: 'admin',
    categorie: this.messageForm.value.categorie
  };

  this.messageService.sendMessage(payload).subscribe({
    next: () => this.handleSendSuccess(),
    error: (err) => {
      console.error('Erreur envoi demande admin:', err);
      this.showAlertMessage('Erreur lors de l\'envoi de la demande', 'danger');
    }
  });
}


// Envoi à un seul élève
private sendToSingleParentEleve(eleveId: number, messageData: any) {
   // 1. Trouver l'objet Eleve dans la liste locale pour accéder à parent_id
  const eleve = this.eleves.find(e => e.id === eleveId);

  // Vérification de la présence de l'élève et de son parent_id
  if (!eleve) {
    this.showAlertMessage(`Erreur: Élève (ID: ${eleveId}) non trouvé.`, 'danger');
    return;
  }

  // Le backend Laravel a confirmé que l'ID du parent est dans la propriété 'parent_id'
  const parentId = eleve.parent_id;

  if (!parentId) {
    this.showAlertMessage(`Erreur: Le parent de l'élève ${eleve.prenom} ${eleve.nom} n'est pas associé.`, 'danger');
    return;
  }
  const payload = {
    ...messageData,
    destinataire_id: parentId,
    role_destinataire: 'parent' // ou 'eleve' selon votre logique
  };

  this.messageService.sendMessage(payload).subscribe({
    next: () => this.handleSendSuccess(),
    error: (err) => {
      console.error('Erreur envoi message:', err);
      this.showAlertMessage('Erreur lors de l\'envoi du message', 'danger');
    }
  });
}

// Envoi à plusieurs élèves
private sendToMultipleEleves(elevesIds: number[], messageData: any) {
  const requests = elevesIds.map(eleveId => {
    const payload = {
      ...messageData,
      destinataire_id: eleveId,
      role_destinataire: 'eleve'
    };
    return this.messageService.sendMessage(payload);
  });

  // Envoi parallèle de tous les messages
  Promise.all(requests.map(req => req.toPromise()))
    .then(() => {
      this.handleSendSuccess();
      this.showAlertMessage(`Message envoyé à ${elevesIds.length} parents`, 'success');
    })
    .catch(err => {
      console.error('Erreur envoi messages multiples:', err);
      this.showAlertMessage('Erreur lors de l\'envoi des messages', 'danger');
    });
}





  calculerStatistiques() {
    this.demandesEnAttente = this.demandesAdmin.filter(d => d.statut === 'en_attente').length;
    this.demandesEnCours = this.demandesAdmin.filter(d => d.statut === 'en_cours').length;
    this.demandesResolues = this.demandesAdmin.filter(d => d.statut === 'resolue').length;
  }

  nouvelleDemande() {
    this.currentSection = 'composer';
    this.typeDestinataire = 'admin';
  }

  voirDemandesEnCours() {
    this.filteredMessages = this.messagesEnvoyes.filter(msg => msg.role_destinataire === 'admin');
    this.currentSection = 'envoyes';
  }

  contacterUrgence() {
    this.currentSection = 'composer';
    this.typeDestinataire = 'admin';
    this.priorite = 'urgent';
    this.messageForm.patchValue({
      type: 'urgence',
      categorie: 'technique',
      objet: 'URGENT - Problème technique nécessitant une intervention immédiate'
    });
  }

  voirDemande(demande: DemandeAdmin) {
    // Implémentez la vue détaillée d'une demande
   }

  relancerDemande(demande: DemandeAdmin) {
    // Méthode simulée - à adapter avec votre API réelle
    this.showAlertMessage('Demande relancée avec succès', 'success');
  }

  getStatutDemandeLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'resolue': 'Résolue'
    };
    return labels[statut] || statut;
  }

  getPrioriteLabel(priorite: string): string {
    const labels: { [key: string]: string } = {
      'normal': 'Normale',
      'haute': 'Haute',
      'urgent': 'Urgente'
    };
    return labels[priorite] || priorite;
  }

  getStatusClass(statut: string): string {
    return statut || 'en_attente';
  }

  getStatusIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'en_attente': 'fa-clock',
      'en_cours': 'fa-cog',
      'resolue': 'fa-check-circle',
      'rejetee': 'fa-times-circle'
    };
    return icons[statut] || 'fa-clock';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'en_cours': 'En cours de traitement',
      'resolue': 'Résolue',
      'rejetee': 'Rejetée'
    };
    return labels[statut] || 'En attente';
  }





  getMessagesRecus(): void {
    this.messageService.getReceived(this.userId ?? 0).subscribe({
      next: (data) => {
        this.messagesRecus = data;
        this.filteredMessages = data;
        this.unreadCount = data.filter(msg => msg.statut === 'non_lu').length;
        console.log('les donne depuis le backend ',data);
        console.log('user id',this.userId)
        console.log('messagesRecus', this.messagesRecus);
      },
      error: (err: any) => console.error('Erreur chargement messages:', err)
    });
  }

  getMessagesEnvoyes(): void {
    this.messageService.getSent(this.userId ?? 0).subscribe({
      next: (data) =>{ this.messagesEnvoyes = data,
            console.log('messagesEnvoyes', this.messagesEnvoyes);
      },

      error: (err: any) => console.error('Erreur chargement messages envoyés:', err)
    });
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
getEleves() {
  this.userService.getElevesAvecMatricule().subscribe({
    next: (data) => {
      this.eleves = data;
      this.filteredEleves = data; // Initialise filteredEleves


    },
    error: (err) => console.error('Erreur chargement élèves:', err)
  });
}
  private markFormGroupTouched() {
    Object.keys(this.messageForm.controls).forEach(key => {
      this.messageForm.get(key)?.markAsTouched();
    });
  }

  resetForm() {
    this.messageForm.reset({ type: 'message' });
    this.typeDestinataire = 'eleve';
  }

  refreshMessages() {
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
    this.showAlertMessage('Messages actualisés', 'info');
  }

  marquerCommeLu(id: number) {
    this.messageService.markAsRead(id).subscribe(() => {
      this.getMessagesRecus();
    });
  }

  selectMessage(message: Message) {
    this.selectedMessage = message;
    if (message.statut === 'non_lu') {
      this.marquerCommeLu(message.id!);
    }
  }

 repondreMessage(message: Message): void {
  this.currentSection = 'composer';

  // Pré-remplir le formulaire avec les infos du message original
  this.messageForm.patchValue({
    objet: `RE: ${message.objet}`,
    contenu: `\n\n--- Message original ---\nDe: ${this.getExpediteurName(message.expediteur_id)}\n${message.contenu}`,
    type: 'message'
  });

  // 🔥 Logiques selon le rôle de l’expéditeur du message
  switch (message.role_expediteur) {
    case 'admin':
      // Réponse à l’administration
      this.typeDestinataire = 'admin';
      this.messageForm.patchValue({ destinataire_id: null });
      console.log('✅ Réponse configurée pour ADMIN');
      break;

    case 'parent':
      // Réponse à un parent (on répond directement à son compte utilisateur)
      this.typeDestinataire = 'eleve'; // car la réponse passe par la section des messages élèves/parents
      this.messageForm.patchValue({ destinataire_id: message.expediteur_id });
      console.log('✅ Réponse configurée pour un PARENT');
      break;

    case 'eleve':
      // Réponse à un élève
      this.typeDestinataire = 'eleve';
      this.messageForm.patchValue({ destinataire_id: message.expediteur_id });
      console.log('✅ Réponse configurée pour un ÉLÈVE');
      break;

    default:
      console.warn('⚠️ Rôle expéditeur non reconnu:', message.role_expediteur);
      this.typeDestinataire = 'eleve';
      this.messageForm.patchValue({ destinataire_id: '' });
      this.showAlertMessage('Destinataire non reconnu. Sélectionnez-le manuellement.', 'danger');
      break;
  }

  this.priorite = 'normal';

  console.log('=== FIN REPRISE MESSAGE ===');
  console.log('Type destinataire sélectionné:', this.typeDestinataire);
  console.log('Valeurs du formulaire:', this.messageForm.value);
}

  filterMessages(event: any) {
    const filter = event.target.value;

    switch (filter) {
      case 'unread':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.statut === 'non_lu');
        break;
      case 'announcements':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.type === 'annonce');
        break;
      case 'admin':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.expediteur_type === 'admin');
        break;
      default:
        this.filteredMessages = this.messagesRecus;
    }
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

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      message: 'Message',
      annonce: 'Annonce',
      urgence: 'Urgent',
      demande: 'Demande',
      technique: 'Technique'
    };
    return labels[type] || 'Message';
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

  getDestinataireInfo(msg: Message): string {
    if (msg.role_destinataire === 'admin') {
      return 'Administration';
    }
    if (msg.destinataire_id) {
      const eleve = this.eleves.find(e => e.id === msg.destinataire_id);
      return eleve ? `${eleve.prenom} ${eleve.nom}` : `Élève ${msg.destinataire_id}`;
    }
    return 'Classe entière';
  }



    closeMessageModal(): void {
  this.selectedMessage = null;
}
}
