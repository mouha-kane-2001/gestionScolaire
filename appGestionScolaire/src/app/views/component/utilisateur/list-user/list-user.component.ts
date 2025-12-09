import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
  import { FormsModule} from '@angular/forms';
import { UserService } from '../../../../services/utilisateur/user.service';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.scss']
})
export class ListUserComponent implements OnInit{

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





 utilisateurs: any[] = [];
allUtilisateurs: any[] = [];     // copie complète avant filtrage
  selectedRole: string = '';       // rôle choisi dans le select
         // total des utilisateurs pour la pagination


         // Dans la classe ListUserComponent, ajoutez :
page: number = 1;
perPage: number = 10;
totalUsers: number = 0;
get totalPages(): number {
  return Math.ceil(this.totalUsers / this.perPage);
}

// Méthode pour changer de page
changePage(newPage: number) {
  if (newPage < 1 || newPage > this.totalPages) return;
  this.page = newPage;
  this.chargerUtilisateurs();
}

// Méthode pour générer un tableau de pages à afficher
getPageNumbers(): number[] {
  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, this.page - 2);
  let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}




   selectedUser: any = null;
  mode: 'liste' | 'edition' = 'liste';

  constructor(private userService: UserService,private router: Router) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }


  chargerUtilisateurs() {
  this.userService.getUsersPaginated(this.page, this.perPage).subscribe({
    next: (res: any) => {
      this.utilisateurs = res.data;     // <-- utilise res.data
      this.totalUsers = res.total;      // pour la pagination
      this.allUtilisateurs = res.data;  // si tu veux garder l'original
    },
    error: (err: any) => {
      console.error(err);
      this.showAlertMessage('Erreur lors du chargement des utilisateurs','danger');
    }
  });
}


getCountByRole(role: string): number {
  return this.utilisateurs.filter(u => u.role === role).length;
}

supprimerUtilisateur(id: number) {
  this.userService.deleteUser(id).subscribe({
    next: () => {
      this.showAlertMessage("Suppression réussie,'danger");
      this.chargerUtilisateurs();
    },
    error: (err) => {
      alert(err.error.message); // message du backend
    }
  });
}

modifierUtilisateur(u: any) {
  // Ici, tu ouvres ton formulaire avec les données de l'utilisateur
  this.userService.getUserById(u.id).subscribe((data: any) => {
    // data contient les infos complètes
    console.log('Utilisateur chargé:', data);
    // ensuite tu peux remplir ton formulaire ou envoyer à un autre composant
  });
  this.router.navigate(['/users/edit', u.id]);
}

changeUserRole(u: any, nouveauRole: string) {
  this.userService.changeUserRole(u.id, nouveauRole).subscribe(() => {
    alert('Rôle mis à jour !');
    this.chargerUtilisateurs();
  });
}

filtrerParRole() {
    if (!this.selectedRole || this.selectedRole === 'ALL') {
      this.utilisateurs = [...this.allUtilisateurs];
    } else {
      this.utilisateurs = this.allUtilisateurs.filter(u => u.role === this.selectedRole);
    }
  }




}
