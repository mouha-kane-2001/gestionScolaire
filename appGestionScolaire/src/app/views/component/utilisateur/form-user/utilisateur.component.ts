import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
 import { UserService } from '../../../../services/utilisateur/user.service';
import { ReferenceService } from '../../../../services/reference/reference.service';
import { Utilisateur } from '../../../../models/utilisateur.model';
import { Classe } from '../../../../models/classe.model';
import { Matiere } from '../../../../models/matiere.model';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements OnInit {
utilisateur :Utilisateur = {
    id: null,
    telephone: '',
    email: '',
    prenom: '',
    nom: '',
    motDePasseClaire: '',
    role: 'eleve',
    classe_id: null,          // Pour élève et professeur

    matiere_id :null,      // Pour professeur
    elevesIds: []  as number[]         // Pour parent
  };
classes: Classe[] = [];     // Liste des classes depuis l'API
  matieres: Matiere[] = [];    // Liste des matières depuis l'API
  eleves: any[] = [];      // Liste des élèves depuis l'API

 onEleveSelectionChange(event: any, eleveId: number) {
  if (event.target.checked) {
    this.utilisateur.elevesIds.push(eleveId);
  } else {
    this.utilisateur.elevesIds = this.utilisateur.elevesIds.filter(id => id !== eleveId);
  }
}


  onTypeUtilisateurChange() {
     this.utilisateur.classe_id = null;
    this.utilisateur.matiere_id = null;
    this.utilisateur.elevesIds = [];
  }


  mode: 'ajout' | 'modif' = 'ajout';
  motDePasse: string = '';
  confirmerMotDePasse: string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private referenceService: ReferenceService

  ) {}

 ngOnInit(): void {
  // Charger les listes
  this.chargerClasses();
  this.chargerMatieres();
  this.chargerEleves();

  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.mode = 'modif';
    this.userService.getUserById(+id).subscribe({
      next: (data: any) => {
        // Pour les champs spécifiques
        this.utilisateur = {
          ...data,
          motDePasseHash: '',
          classeId: data.classeId || null,
          matiere_id: data.matiere_id || null,
          elevesIds: data.elevesIds || []
        };
      },
      error: () => alert('Erreur lors du chargement de l’utilisateur')
    });
  }
}
chargerClasses() {
  this.referenceService.getClasses().subscribe({
    next: (data) => this.classes = data,
    error: () => console.error('Erreur lors du chargement des classes')
  });
}

chargerMatieres() {
  this.referenceService.getMatieres().subscribe({
    next: (data) => this.matieres = data,
    error: () => console.error('Erreur lors du chargement des matières')
  });
}

chargerEleves() {
  this.userService.getElevesAvecMatricule().subscribe({
    next: (data) => {
      console.log('Données élèves reçues :', data); // Vérifie que le matricule est présent

      // Stocker les élèves directement
      this.eleves = data;
      this.allEleves = [...data];
      this.filteredEleves = [...data];
    },
    error: (err) => {
      console.error('Erreur lors du chargement des élèves', err);
    }
  });
}




soumettreFormulaire() {
  if (this.mode === 'ajout') {
    if (!this.motDePasse || !this.utilisateur.email) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    if (this.motDePasse.trim() !== '' && this.motDePasse !== this.confirmerMotDePasse) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    this.utilisateur.motDePasseClaire = this.motDePasse;

    // Préparer l'objet complet à envoyer
    const userData = {
      prenom: this.utilisateur.prenom,
      nom: this.utilisateur.nom,
      email: this.utilisateur.email,
      password: this.utilisateur.motDePasseClaire,
      role: this.utilisateur.role,
      telephone: this.utilisateur.telephone,
      classe_id: this.utilisateur.classe_id,
       elevesIds: this.utilisateur.elevesIds,
      matiere_id : this.utilisateur.matiere_id
    };

    console.log('Données envoyées:', userData);

    this.userService.createUser(userData).subscribe({
      next: () => {
        alert('Utilisateur ajouté avec succès !');
        this.resetForm();
        this.router.navigate(['/users']);
      },
      error: (err) => {
        if (err.status === 400 && err.error?.message?.includes('email')) {
          alert('Cet email existe déjà.');
        } else {
          console.error('Erreur complète:', err);
          alert('Erreur lors de l\'ajout: ' + (err.error?.message || 'Erreur inconnue'));
        }
      }
    });
  }  else { // Modification

      if (!this.utilisateur.id) {
        alert('Aucun utilisateur sélectionné pour modification');
        return;
      }

      if (this.motDePasse.trim() !== '') {
        if (this.motDePasse !== this.confirmerMotDePasse) {
          alert('Les mots de passe ne correspondent pas.');
          return;
        }
        this.utilisateur.motDePasseClaire = this.motDePasse;
      }

      this.userService.updateUser(this.utilisateur.id, this.utilisateur).subscribe({
        next: () => {
          alert('Utilisateur modifié avec succès !');
          this.resetForm();
        this.router.navigate(['/users']);
        },
        error: (err) => {
          if (err.status === 400 && err.error?.message?.includes('email')) {
            alert('Cet email existe déjà.');
          } else {
            alert('Erreur lors de la modification');
          }
        }
      });
    }
  }

  editerUtilisateur(user: any) {
    this.utilisateur = { ...user, motDePasse: '' };
    this.mode = 'modif';
  }

  resetForm() {
    this.utilisateur = { id: null, email: '', motDePasseClaire: '', matiere_id :null, prenom: '', nom: '', telephone: '',role: 'eleve', classe_id: null,  elevesIds: [] };
    this.motDePasse = '';
    this.confirmerMotDePasse = '';
    this.mode = 'ajout';
  }
  // utilisateur.component.ts
searchResults: any[] = [];

searchEleves(event: any) {
  const term = event.target.value.trim();
  if (term === '') {
    this.searchResults = [];
    return;
  }

  this.userService.searchEleves(term).subscribe(results => {
    this.searchResults = results;
  });
}


searchQuery: string = '';
 selectedEleves: any[] = [];





removeEleve(eleveId: number) {
  this.selectedEleves = this.selectedEleves.filter(e => e.id !== eleveId);
  this.utilisateur.elevesIds = this.utilisateur.elevesIds.filter((id: number) => id !== eleveId);
}







allEleves: any[] = [];      // Tous les élèves récupérés depuis l'API
 filteredEleves: any[] = [];

// Filtrer les élèves selon le texte entré
filterEleves() {
  const term = this.searchQuery.trim().toLowerCase();
  if (!term) {
    this.filteredEleves = [...this.allEleves]; // tous les élèves si recherche vide
  } else {
    this.filteredEleves = this.allEleves.filter(e =>
      e.prenom.toLowerCase().includes(term) ||
      e.nom.toLowerCase().includes(term) ||
      (e.matricule && e.matricule.toLowerCase().includes(term))
    );
  }
}


// Sélectionner un élève pour le parent
addEleve(eleve: any) {
  if (!this.utilisateur.elevesIds.includes(eleve.id)) {
    this.utilisateur.elevesIds.push(eleve.id);
  }
}

}
