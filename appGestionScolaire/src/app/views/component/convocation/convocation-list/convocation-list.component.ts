import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { ConvocationService } from '../../../../services/convocation/convocation.service';

@Component({
  selector: 'app-convocation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convocation-list.component.html',
  styleUrls: ['./convocation-list.component.scss']
})
export class ConvocationListComponent implements OnInit {


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



  
  parentId: number | null = null;
  convocations: any[] = [];
  convocationsFiltrees: any[] = [];
  eleves: any[] = [];
  loading = true;

  // Filtres
  filtreEleve: string = '';
  filtreStatut: string = '';

  // Pagination
  page = 1;
  pageSize = 10;
  totalPages = 1;

  // Modal
  selectedConvocation: any = null;
  showModal = false;

  constructor(
    private authService: AuthService,
    private convocationService: ConvocationService
  ) {}

  ngOnInit(): void {
    this.parentId = this.authService.getSpecificId();
    this.loadConvocations();

  }

  loadConvocations(): void {
    if (!this.parentId) return;

    this.convocationService.getConvocationsByParent(this.parentId).subscribe({
      next: (data) => {
        this.convocations = data;
        console.log('Convocations chargées:', this.convocations);
        this.extractEleves();
        this.filtrerConvocations();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

   extractEleves(): void {
  const elevesMap = new Map();
  this.convocations.forEach(convocation => {
    if (convocation.eleve) {
      console.log('Élève trouvé:', convocation.eleve);
      elevesMap.set(convocation.eleve.id, convocation.eleve);
    }
  });
  this.eleves = Array.from(elevesMap.values());
}


  filtrerConvocations(): void {
     let filtered = this.convocations;
console.log('Filtrage des convocations avec filtreEleve:', filtered, this.filtreEleve);
    // Filtre par élève
    if (this.filtreEleve) {
  filtered = filtered.filter(c => c.eleve?.id.toString() === this.filtreEleve);
}

    // Filtre par statut
    if (this.filtreStatut) {
      filtered = filtered.filter(c => c.etat === this.filtreStatut);
    }

    // Tri par date (plus récent en premier)
    filtered = filtered.sort((a, b) =>
      new Date(b.date_convocation).getTime() - new Date(a.date_convocation).getTime()
    );

    this.convocationsFiltrees = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.convocationsFiltrees.length / this.pageSize);
    this.page = 1; // Reset à la première page après filtrage
  }

  getUnreadCount(): number {
    return this.convocations.filter(c => c.etat === 'non_lue').length;
  }

  getMessagePreview(message: string): string {
    return message.length > 150 ? message.substring(0, 150) + '...' : message;
  }

  openDetails(convocation: any): void {
    this.selectedConvocation = convocation;
    console.log('Détails de la convocation:', convocation);
    this.showModal = true;
    document.body.style.overflow = 'hidden';

    // Marquer comme lu automatiquement à l'ouverture
    if (convocation.etat === 'non_lue') {
      this.markAsRead(convocation);
    }
  }

  markAsRead(convocation: any): void {
    if (convocation.etat === 'non_lue') {
      this.convocationService.markAsRead(convocation.id).subscribe({
        next: () => {
          convocation.etat = 'lue';
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
    }
  }

  closeModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showModal = false;
    this.selectedConvocation = null;
    document.body.style.overflow = 'auto';
  }

  // Pagination
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  get convocationsPage(): any[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.convocationsFiltrees.slice(start, end);
  }
}
