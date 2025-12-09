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
    originalEmail: string = ''; // ← ajoute cette ligne

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
        this.originalEmail = data.email; // ← important !
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
      this.showAlertMessage('Tous les champs sont obligatoires.','danger');
      return;
    }

    if (this.motDePasse.trim() !== '' && this.motDePasse !== this.confirmerMotDePasse) {
      this.showAlertMessage('Les mots de passe ne correspondent pas.','danger');
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
      this.resetForm();
       this.showAlertMessage('Utilisateur ajouté avec succès !','success');

      setTimeout(() => {
  this.router.navigate(['/users']);
}, 1500);



    },


      error: (err) => {
        if (err.status === 400 && err.error?.message?.includes('email')) {
          this.showAlertMessage('Cet email existe déjà.','danger');
        } else {
          console.error('Erreur complète:', err);
          this.showAlertMessage('Erreur lors de l\'ajout: ' + (err.error?.message || 'Erreur inconnue'));
        }
      }
    });
  }  else { // Modification
// Modification
  if (!this.utilisateur.id) {
    this.showAlertMessage('Aucun utilisateur sélectionné pour modification','danger');
    return;
  }

  // Préparer le payload
  const userData: any = {
  prenom: this.utilisateur.prenom,
  nom: this.utilisateur.nom,
  role: this.utilisateur.role,
  telephone: this.utilisateur.telephone || '',
  classe_id: this.utilisateur.classe_id || null,
  matiere_id: this.utilisateur.matiere_id || null,
    email: this.utilisateur.email // ← toujours envoyé
};

  // Ajouter le mot de passe seulement si l'utilisateur en a saisi un
  // Inclure le mot de passe uniquement si modifié
if (this.motDePasse && this.motDePasse.trim() !== '') {
  if (this.motDePasse !== this.confirmerMotDePasse) {
    this.showAlertMessage('Les mots de passe ne correspondent pas.','danger');
    return;
  }
  userData.password = this.motDePasse;
}

// Inclure l’email seulement si il a été changé
if (this.utilisateur.email !== this.originalEmail) {
  userData.email = this.utilisateur.email;
}

  console.log('Payload modification:', userData);

  this.userService.updateUser(this.utilisateur.id, userData).subscribe({
    next: () => {
      this.resetForm();
       this.showAlertMessage('Utilisateur modifié avec succès ! !', 'success');

      setTimeout(() => {
  this.router.navigate(['/users']);
}, 1500);



    },
    error: (err) => {
      console.error(err);
      if (err.status === 400 && err.error?.message?.includes('email'),'danger') {
        this.showAlertMessage('Cet email existe déjà.','danger');
      } else {
        this.showAlertMessage('Erreur lors de la modification: ' + JSON.stringify(err.error),'danger');
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
