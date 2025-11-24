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
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit{

 utilisateurs: any[] = [];
allUtilisateurs: any[] = [];     // copie complète avant filtrage
  selectedRole: string = '';       // rôle choisi dans le select


   selectedUser: any = null;
  mode: 'liste' | 'edition' = 'liste';

  constructor(private userService: UserService,private router: Router) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }


  chargerUtilisateurs() {
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.utilisateurs = data;
        this.allUtilisateurs = data;       // on garde l'original

      },
      error: (err: any) => {
        console.error(err);
        alert('Erreur lors du chargement des utilisateurs');
      }
    });
  }
getCountByRole(role: string): number {
  return this.utilisateurs.filter(u => u.role === role).length;
}

supprimerUtilisateur(id: number) {
  this.userService.deleteUser(id).subscribe({
    next: () => {
      alert("Suppression réussie");
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
  this.router.navigate(['/utilisateurs/edit', u.id]);
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
