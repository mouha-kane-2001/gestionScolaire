import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/Auth`;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  // CORRECTION CRITIQUE : Ajoutez le type de retour et la gestion d'erreurs
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((response: any) => {
        console.log('Réponse API:', response); // Debug
        this.saveToken(response.token);
        this.saveUserInfo(response.user, response.specific_id);
      }),
      catchError(this.handleError) // Ajoutez la gestion d'erreurs
    );
  }

  // Méthode pour gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP:', error);

    let errorMessage = 'Une erreur est survenue';
    if (error.status === 0) {
      // Client-side or network error
      errorMessage = 'Erreur réseau ou CORS. Vérifiez que le serveur est accessible.';
    } else if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 404) {
      errorMessage = 'API non trouvée';
    } else {
      // Backend error
      errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }



  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('userId');
    localStorage.removeItem('nomUtilisateur');
    localStorage.removeItem('role');
  }

  estConnecte(): boolean {
    return !!this.getToken();
  }

  // --- Gestion du Token ---
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // --- Gestion des infos utilisateur ---
  // --- Gestion des infos utilisateur ---


  getUserInfo() {
    return {
      id: this.getUserId(),
      nomUtilisateur: localStorage.getItem('nomUtilisateur'),
      typeUtilisateur: localStorage.getItem('role')
    };
  }



  private getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }




// auth.service.ts
saveUserInfo(user: any, specificId: number | null) {
  localStorage.setItem('userId', user.id.toString());
  localStorage.setItem('nomUtilisateur', user.nom + ' ' + user.prenom);
  localStorage.setItem('role', user.role);

  // ✅ Sauvegarder l'ID spécifique pour TOUS les rôles
  if (specificId !== null && specificId !== undefined) {
    localStorage.setItem('specific_id', specificId.toString());

    // Sauvegarde supplémentaire par rôle si nécessaire
    switch (user.role.toLowerCase()) {
      case 'parent':
        localStorage.setItem('parent_id', specificId.toString());
        break;
      case 'eleve':
        localStorage.setItem('eleve_id', specificId.toString());
        break;
      case 'professeur':
        localStorage.setItem('professeur_id', specificId.toString());
        break;
      case 'admin':
        localStorage.setItem('admin_id', specificId.toString());
        break;
    }
  } else {
    console.warn('Aucun specific_id trouvé pour l\'utilisateur');
  }
}

// Méthode pour récupérer l'ID spécifique global
getSpecificId(): number | null {
  const id = localStorage.getItem('specific_id');
  return id ? parseInt(id) : null;
}

// Méthodes pour récupérer les IDs par rôle
getParentId(): number | null {
  const id = localStorage.getItem('parent_id');
  return id ? parseInt(id) : null;
}

getEleveId(): number | null {
  const id = localStorage.getItem('eleve_id');
  return id ? parseInt(id) : null;
}

getProfesseurId(): number | null {
  const id = localStorage.getItem('professeur_id');
  return id ? parseInt(id) : null;
}

getAdminId(): number | null {
  const id = localStorage.getItem('admin_id');
  return id ? parseInt(id) : null;
}

// Méthode générique pour récupérer l'ID selon le rôle actuel
getCurrentRoleId(): number | null {
  return this.getSpecificId(); // ✅ Retourne toujours l'ID spécifique
}

// Méthodes pour récupérer les IDs





}
