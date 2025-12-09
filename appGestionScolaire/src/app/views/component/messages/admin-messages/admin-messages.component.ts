import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Message, MessageService } from '../../../../services/messages/message.service';
import { Classe } from '../../../../models/classe.model';
import { TruncatePipe } from '../../../../pipes/truncate.pipe';
import { UserService } from '../../../../services/utilisateur/user.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Eleve } from '../../../../models/eleve.model';
import { Utilisateur } from '../../../../models/utilisateur.model';



interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  user: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
  };
  user_id: number;
}

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
  selector: 'app-admin-messages',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TruncatePipe],
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.scss'],
  standalone: true
})
export class AdminMessagesComponent implements OnInit {


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
  professeurs: Professeur[] = [];
  filteredEleves: Eleve[] = [];
  classeFilter: string = '';
  adminId: number | null = null;
  userId: number | null = null;
  role_expediteur: string | null = null;

   users: Utilisateur[] = [];

  messageForm: FormGroup;

  typeDestinataire: 'eleve' | 'classe' | 'prof' | 'tous_eleves'|'parent' | 'tous_profs' = 'eleve';
  currentSection: 'composer' | 'recus' | 'envoyes'  = 'composer';
  selectedMessage: Message | null = null;
  priorite: string = 'normal';

  unreadCount = 0;

  // Statistiques
  demandesEnAttente = 0;
  demandesEnCours = 0;
  demandesResolues = 0;




repondreMessage(message: Message): void {
  this.currentSection = 'composer';

  // Pré-remplir le formulaire avec les informations de réponse
  this.messageForm.patchValue({
    objet: `RE: ${message.objet}`,
    contenu: `\n\n--- Message original ---\nDe: ${this.getExpediteurName(message.expediteur_id)}\n${message.contenu}`,
    type: 'message'
  });



  // Définir le type de destinataire selon le role_expediteur
  if (message.role_expediteur === 'prof') {
    this.typeDestinataire = 'prof';

    // Vérifier si le professeur existe dans la liste
    const prof = this.professeurs.find(p => p.id === message.expediteur_id);
    console.log('Professeur trouvé:', prof);



    if (prof) {
      this.messageForm.patchValue({
        destinataire_id: prof.id

      });
      console.log('✅ Réponse à un professeur configurée:', prof.prenom, prof.nom);
    } else {
      console.warn('❌ Professeur non trouvé dans la liste');
     }

  } else if (message.role_expediteur === 'parent') {
    this.typeDestinataire = 'parent';


    const eleve = this.eleves.find(e => {
       return e.parent?.user_id === message.expediteur_id;
    });

    if (eleve) {
      this.messageForm.patchValue({
        destinataire_id: eleve.id
      });
     } else {

      this.eleves.forEach(e => {
        if (e.parent) {
          console.log(`- ${e.prenom} ${e.nom}: parent_id=${e.parent.user_id}`);
        }
      });
      this.showAlertMessage('Destinataire non trouvé, veuillez le sélectionner manuellement', 'danger');
    }
  } else {
    console.warn('Role expéditeur non géré:', message.role_expediteur);
    this.typeDestinataire = 'eleve';
  }

  this.priorite = 'normal';


}

  getUniqueClassesCount(): number {
  const classes = this.messagesEnvoyes
    .filter(msg => msg.classe_id)
    .map(msg => msg.classe_id);
  return new Set(classes).size;
}

getAnnouncementsCount(): number {
  return this.messagesEnvoyes.filter(msg => msg.type === 'annonce').length;
}

resendMessage(message: Message): void {
  this.currentSection = 'composer';
  this.messageForm.patchValue({
    objet: message.objet,
    contenu: message.contenu,
    type: message.type
  });
  // Correction : fournir une valeur par défaut si message.priorite est undefined
  this.priorite = message.priorite || 'normal';
}
// Méthodes pour la modal
openMessageModal(message: Message): void {
  this.selectedMessage = message;
  // Marquer comme lu si ce n'est pas déjà fait
  if (message.statut === 'non_lu') {
    this.marquerCommeLu(message.id!);
  }
}

closeMessageModal(): void {
  this.selectedMessage = null;
}

// Ajoutez ces propriétés calculées
  get messageStandardCount(): number {
    return this.messagesRecus.filter(m => m.type === 'message').length;
  }

  get annonceCount(): number {
    return this.messagesRecus.filter(m => m.type === 'annonce').length;
  }

  get urgenceCount(): number {
    return this.messagesRecus.filter(m => m.type === 'urgence').length;
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
    private referenceService: ReferenceService,
    private authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      destinataire_id: [''],
      classe_id: [''],
      type: ['message', Validators.required],
      categorie: [''],
      objet: ['', [Validators.required, Validators.minLength(3)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {

    const userInfo = this.authService.getUserInfo();

  if (!userInfo) {
    console.warn("UserInfo non disponible encore");
    setTimeout(() => this.ngOnInit(), 200); // Retente après 200ms
    return;
  }

   this.role_expediteur = userInfo.typeUtilisateur;

    this.adminId = userInfo?.id;
    this.role_expediteur = this.authService.getUserInfo().typeUtilisateur;
 this.userId = userInfo?.id;


    this.initForm();
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
    this.getClasses();
    this.getEleves();
    this.getProfesseurs();
     this.calculerStatistiques();
    this.getUtilisateur();


    console.log('role_expediteur', this.role_expediteur);
  }

  onClasseFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const classeNom = target.value;
    this.filterElevesParClasse(classeNom);
  }

  initForm(): void {
    this.messageForm = this.fb.group({
      destinataire_id: [''],
      classe_id: [''],
      type: ['message', Validators.required],
      categorie: [''],
      objet: ['', [Validators.required, Validators.minLength(3)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getUtilisateur (){
    this.userService.getAllUsers().subscribe(data => {
  this.users = data;
});
  }

  getSectionTitle(): string {
    const titles = {
      'composer': 'Nouveau message',
      'recus': 'Boîte de réception',
      'envoyes': 'Messages envoyés'
     };
    return titles[this.currentSection];
  }

  getObjetPlaceholder(): string {
    const placeholders = {
      'eleve': 'Objet du message au parent...',
      'classe': 'Objet du message à la classe...',
      'prof': 'Objet du message au professeur...',
      'tous_eleves': 'Objet de l\'annonce à tous les élèves...',
      'tous_profs': 'Objet de l\'annonce à tous les professeurs...',
      'parent': 'Objet du message au parent...'
    };
    return placeholders[this.typeDestinataire] || 'Saisissez l\'objet de votre message...';
  }

  getContenuPlaceholder(): string {
    const placeholders = {
      'eleve': 'Rédigez votre message au parent...',
      'classe': 'Rédigez votre message à la classe...',
      'prof': 'Rédigez votre message au professeur...',
      'tous_eleves': 'Rédigez votre annonce à tous les élèves...',
      'tous_profs': 'Rédigez votre annonce à tous les professeurs...',
      'parent': 'Rédigez votre message au parent...'
    };
    return placeholders[this.typeDestinataire] || 'Rédigez votre message ici...';
  }

  private handleSendSuccess(): void {
    this.messageForm.reset({ type: 'message' });
    this.typeDestinataire = 'eleve';
    this.priorite = 'normal';
    this.classeFilter = '';
    this.filteredEleves = [];

    this.getMessagesEnvoyes();
    this.currentSection = 'envoyes';

    this.showAlertMessage('Message envoyé avec succès', 'success');
  }

  filterElevesParClasse(classeNom?: string): void {
    if (!classeNom || classeNom === '') {
      this.filteredEleves = this.eleves;
      this.classeFilter = '';
      this.messageForm.patchValue({ destinataire_id: '' });
    } else {
      this.filteredEleves = this.eleves.filter(eleve =>
        eleve.classe.nom === classeNom
      );
      this.classeFilter = classeNom;
      this.messageForm.patchValue({ destinataire_id: '' });
    }
  }

  envoyerMessage(): void {
    if (this.messageForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.messageForm.value;

    // Préparer les données de base
    const messageData: any = {
      expediteur_id: this.userId,
      role_expediteur: 'admin',
      objet: formValue.objet,
      contenu: formValue.contenu,
      type: formValue.type,
      priorite: this.priorite,
      role_destinataire: ''
    };

    console.log('Form Value:', formValue);
    console.log('Message data:', messageData);

    // Gérer les différents types d'envoi
    switch (this.typeDestinataire) {
      case 'eleve':
        messageData.role_destinataire = 'parent';
        if (formValue.destinataire_id) {
          this.sendToSingleEleve(formValue.destinataire_id, messageData);
        } else {
          this.showAlertMessage('Veuillez sélectionner un élève', 'danger');
        }
        break;

      case 'classe':
        messageData.role_destinataire = 'parent';
        if (formValue.classe_id) {
          this.sendToClasse(formValue.classe_id, messageData);
        } else {
          this.showAlertMessage('Veuillez sélectionner une classe', 'danger');
        }
        break;

      case 'prof':

        messageData.role_destinataire = 'prof';
        if (formValue.destinataire_id) {
          this.sendToSingleProf(formValue.destinataire_id, messageData);
        } else {
          this.showAlertMessage('Veuillez sélectionner un professeur', 'danger');
        }
        break;

      case 'tous_eleves':
        messageData.role_destinataire = 'parent';
        this.sendToAllEleves(messageData);
        break;

      case 'tous_profs':
        messageData.role_destinataire = 'prof';
        this.sendToAllProfs(messageData);
        break;
    }
  }

  // Envoi à un seul parent
  private sendToSingleEleve(eleveId: number, messageData: any): void {
      const eleveIdNumber = typeof eleveId === 'string' ? parseInt(eleveId, 10) : eleveId;

    // Utiliser le Number() ou parseInt() est crucial si la valeur vient directement du formulaire.
    const eleve = this.eleves.find(e => e.id === eleveIdNumber);

    console.log('eleve',this.eleves);

  // Vérification de la présence de l'élève et de son parent_id
  if (!eleve) {
    this.showAlertMessage(`Erreur: eleves (ID: ${eleveId}) non trouvé.`, 'danger');
    return;
  }

  // Le backend Laravel a confirmé que l'ID du parent est dans la propriété 'parent_id'
  const parentId = eleve.parent?.user_id;

  if (!parentId) {
    this.showAlertMessage(`Erreur: Le parent de l'élève ${eleve.prenom} ${eleve.nom} n'est pas associé.`, 'danger');
    return;
  }
    const payload = {
      ...messageData,
      destinataire_id: parentId,
      role_destinataire: 'parent'
    };

    this.messageService.sendMessage(payload).subscribe({
      next: () => this.handleSendSuccess(),
      error: (err) => {
        console.error('Erreur envoi message:', err);
        this.showAlertMessage('Erreur lors de l\'envoi du message', 'danger');
      }
    });
  }

  // Envoi à un seul professeur
  private sendToSingleProf(profId: number, messageData: any): void {
      const profIdNumber = typeof profId === 'string' ? parseInt(profId, 10) : profId;
     console.log(' prof id :', profIdNumber);
    console.log(' professeurs :', this.professeurs);
  const prof = this.professeurs.find(p => p.id === profIdNumber);
  console.log(' prof trouvé :', prof);
  if (!prof) {
    this.showAlertMessage('Professeur introuvable xxxx !', 'danger');
    return;
  }

    const payload = {
      ...messageData,
       destinataire_id: prof.user_id,
      role_destinataire: 'prof'
    };

    this.messageService.sendMessage(payload).subscribe({
      next: () => this.handleSendSuccess(),
      error: (err) => {
        console.error('Erreur envoi message:', err);
        this.showAlertMessage('Erreur lors de l\'envoi du message', 'danger');
      }
    });
  }

  // Envoi à toute une classe
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

  // Envoi à tous les élèves
  private sendToAllEleves(messageData: any): void {
    const payload = {
      ...messageData,
      destinataire_id: null,
      role_destinataire: 'eleve'
    };

    this.messageService.sendMessage(payload).subscribe({
      next: () => {
        this.handleSendSuccess();
        this.showAlertMessage('Message envoyé à tous les parents d\'élèves', 'success');
      },
      error: (err) => {
        console.error('Erreur envoi tous élèves:', err);
        this.showAlertMessage('Erreur lors de l\'envoi à tous les élèves', 'danger');
      }
    });
  }

  // Envoi à tous les professeurs
  private sendToAllProfs(messageData: any): void {
    const payload = {
      ...messageData,
      destinataire_id: null,
      role_destinataire: 'prof'
    };

    this.messageService.sendMessage(payload).subscribe({
      next: () => {
        this.handleSendSuccess();
        this.showAlertMessage('Message envoyé à tous les professeurs', 'success');
      },
      error: (err) => {
        console.error('Erreur envoi tous profs:', err);
        this.showAlertMessage('Erreur lors de l\'envoi à tous les professeurs', 'danger');
      }
    });
  }



  calculerStatistiques(): void {
    this.demandesEnAttente = this.demandesAdmin.filter(d => d.statut === 'en_attente').length;
    this.demandesEnCours = this.demandesAdmin.filter(d => d.statut === 'en_cours').length;
    this.demandesResolues = this.demandesAdmin.filter(d => d.statut === 'resolue').length;
  }

  getProfesseurs(): void {
    this.userService.getProfesseurs().subscribe({
      next: (data) => {
        console.log('Professeurs chargés:', data);
        this.professeurs = data;
      },
      error: (err) => console.error('Erreur chargement professeurs:', err)
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
      next: (data) =>{ this.messagesEnvoyes = data,
            console.log('messagesEnvoyes', this.messagesEnvoyes);
            console.log('userId pour messagesEnvoyes', this.userId);
      },

      error: (err: any) => console.error('Erreur chargement messages envoyés:', err)
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

  getEleves(): void {
    this.userService.getElevesAvecMatricule().subscribe({
      next: (data) => {
        this.eleves = data;
        this.filteredEleves = data;
      },
      error: (err) => console.error('Erreur chargement élèves:', err)
    });
  }

  // Méthodes utilitaires
  private markFormGroupTouched(): void {
    Object.keys(this.messageForm.controls).forEach(key => {
      this.messageForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.messageForm.reset({ type: 'message' });
    this.typeDestinataire = 'eleve';
    this.priorite = 'normal';
    this.classeFilter = '';
    this.filteredEleves = this.eleves;
  }

  refreshMessages(): void {
    this.getMessagesRecus();
    this.getMessagesEnvoyes();
    this.showAlertMessage('Messages actualisés', 'info');
  }

  marquerCommeLu(id: number): void {
    this.messageService.markAsRead(id).subscribe(() => {
      this.getMessagesRecus();
    });
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    if (message.statut === 'non_lu') {
      this.marquerCommeLu(message.id!);
    }
  }

  filterMessages(event: any): void {
    const filter = event.target.value;

    switch (filter) {
      case 'unread':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.statut === 'non_lu');
        break;
      case 'announcements':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.type === 'annonce');
        break;
      case 'parents':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.expediteur_type === 'parent');
        break;
      case 'profs':
        this.filteredMessages = this.messagesRecus.filter(msg => msg.expediteur_type === 'prof');
        break;
      default:
        this.filteredMessages = this.messagesRecus;
    }
  }
// Méthodes supplémentaires pour le template
getClasseName(classeId: number): string {
  const classe = this.classes.find(c => c.id === classeId);
  return classe ? classe.nom : `Classe ${classeId}`;
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
      if (msg.role_destinataire === 'parent') {
        const eleve = this.eleves.find(e => e.id === msg.destinataire_id);
        return eleve ? `Parent de ${eleve.prenom} ${eleve.nom}` : `Parent ${msg.destinataire_id}`;
      } else if (msg.role_destinataire === 'prof') {
        const prof = this.professeurs.find(p => p.id === msg.destinataire_id);
        return prof ? `Prof. ${prof.prenom} ${prof.nom}` : `Professeur ${msg.destinataire_id}`;
      }
    }
    return 'Groupe';
  }





}
