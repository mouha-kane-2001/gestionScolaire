import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Notification, NotificationService } from '../../../services/notifications/notification.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-menu',
  standalone: true,
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class NotificationsMenuComponent implements OnInit {
  userId!: number;
  userRole!: string;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  nbNonLues = 0;

  filtreType: 'toutes' | 'recues' | 'envoyees' = 'toutes';
  filtreStatut: 'toutes' | 'lu' | 'non_lu' = 'toutes';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.userId = userInfo?.id ?? 0;
    this.userRole = userInfo?.typeUtilisateur ?? '';
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.nbNonLues = data.filter((n) => n.statut === 'non_lu').length;
        this.applyFilters();
      },
      error: (err) => console.error(err),
    });
  }

  changerFiltreType(type: 'toutes' | 'recues' | 'envoyees') {
    this.filtreType = type;
    this.applyFilters();
  }

  changerFiltreStatut(statut: 'toutes' | 'lu' | 'non_lu') {
    this.filtreStatut = statut;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredNotifications = this.notifications.filter((n) => {
      const matchType =
        this.filtreType === 'toutes' ||
        (this.filtreType === 'recues' && n.type === 'nouveau_message') ||
        (this.filtreType === 'envoyees' && n.type === 'message_envoye');

      const matchStatut =
        this.filtreStatut === 'toutes' || n.statut === this.filtreStatut;

      return matchType && matchStatut;
    });
  }

  handleNotificationClick(notif: Notification) {
    if (notif.statut === 'non_lu') {
      notif.statut = 'lu';
      this.nbNonLues = Math.max(0, this.nbNonLues - 1);
      this.notificationService.marquerCommeLu(notif.id).subscribe();
    }

    this.redirigerSelonTypeEtRole(notif);
  }

  redirigerSelonTypeEtRole(notif: Notification) {
    switch (notif.type) {
      case 'nouveau_message':
      case 'message_envoye':
        this.redirigerVersMessages();
        break;
      case 'convocation':
        this.redirigerVersConvocations(notif);
        break;
      case 'note':
        this.redirigerVersNotes(notif);
        break;
      case 'bulletin':
        this.redirigerVersBulletins(notif);
        break;
      default:
        this.router.navigate(['notifications', notif.id]);
        break;
    }
  }

  redirigerVersMessages() {
    // Pour les messages, on navigue vers la sous-route spécifique au rôle
    switch (this.userRole?.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/messages/admin']);
        break;
      case 'PROF':
        this.router.navigate(['/prof/messages/prof']);
        break;
      case 'PARENT':
        this.router.navigate(['/parent/messages/parent']);
        break;
      case 'ELEVE':
        this.router.navigate(['/eleve/messages/eleve']);
        break;
      default:
        this.router.navigate(['/messages']);
        break;
    }
  }

  redirigerVersConvocations(notif: Notification) {
    switch (this.userRole?.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/convocations']);
        break;
      case 'PARENT':
        this.router.navigate(['/parent/convocations']);
        break;
      case 'PROF':
      case 'ELEVE':
        // Si convocations n'est pas disponible pour ce rôle
        this.router.navigate(['/notifications', notif.id]);
        break;
      default:
        this.router.navigate(['/convocations']);
        break;
    }
  }

  redirigerVersNotes(notif: Notification) {
    switch (this.userRole?.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/notes/gestion']);
        break;
      case 'PROF':
        if (notif.element_lie_id) {
          this.router.navigate(['/prof/notes/voirNotes']);
        } else {
          this.router.navigate(['/prof/notes/attribue']);
        }
        break;
      case 'PARENT':
        this.router.navigate(['/parent/notes/parent']);
        break;
      case 'ELEVE':
        this.router.navigate(['/eleve/notes/eleve']);
        break;
      default:
        this.router.navigate(['/notes']);
        break;
    }
  }

  redirigerVersBulletins(notif: Notification) {
    // Adaptez selon vos routes de bulletins
    switch (this.userRole?.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/bulletins']);
        break;
      case 'PARENT':
        this.router.navigate(['/parent/bulletins']);
        break;
      case 'ELEVE':
        this.router.navigate(['/eleve/bulletins']);
        break;
      default:
        this.router.navigate(['/notifications', notif.id]);
        break;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'nouveau_message':
      case 'message_envoye':
        return 'bi bi-chat-dots';
      case 'convocation':
        return 'bi bi-megaphone';
      case 'note':
        return 'bi bi-journal-text';
      case 'bulletin':
        return 'bi bi-file-earmark-text';
      default:
        return 'bi bi-bell';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'nouveau_message':
        return 'Message reçu';
      case 'message_envoye':
        return 'Message envoyé';
      case 'convocation':
        return 'Convocation';
      case 'note':
        return 'Note';
      case 'bulletin':
        return 'Bulletin';
      default:
        return 'Notification';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR');
  }

  marquerToutesCommeLues() {
    this.notifications.forEach((n) => (n.statut = 'lu'));
    this.nbNonLues = 0;
    this.applyFilters();
    this.notificationService.marquerToutesCommeLues(this.userId).subscribe();
  }
}
