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
      // 🔹 Types possibles : nouveau_message, convocation, note, bulletin, etc.
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
    // Marquer comme lue localement
    if (notif.statut === 'non_lu') {
      notif.statut = 'lu';
      this.nbNonLues = Math.max(0, this.nbNonLues - 1);
    }

    // Redirection selon le type
    switch (notif.type) {
      case 'nouveau_message':
        this.router.navigate(['/messages', notif.element_lie_id]);
        break;
      case 'convocation':
        this.router.navigate(['/convocations', notif.element_lie_id]);
        break;
      case 'note':
        this.router.navigate(['/notes', notif.element_lie_id]);
        break;
      default:
        this.router.navigate(['/notifications', notif.id]);
        break;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'nouveau_message':
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
  }
}
