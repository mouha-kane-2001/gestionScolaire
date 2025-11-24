import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

private apiUrl = `${environment.apiUrl}/utilisateurs`;
  private elevesUrl = `${environment.apiUrl}/eleves`; // <- base pour élèves

  private profUrl = `${environment.apiUrl}/professeurs`;



  constructor(private http: HttpClient) {}

  // Méthode pour ajouter un utilisateur
  createUser(utilisateur: any): Observable<any> {
    return this.http.post(this.apiUrl, utilisateur);
  }

  getAllUsers() {
  return this.http.get<any[]>(this.apiUrl);
}
  // Récupérer un utilisateur par son id
  getUserById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
 updateUser(id: number, utilisateur: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur);
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

searchEleves(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.elevesUrl}/search?q=${term}`);
  }


  getElevesAvecMatricule(): Observable<any[]> {
    return this.http.get<any[]>(`${this.elevesUrl}/elevesAvecmatricule`);
  }
  getEnfantsParParent(parentId: number): Observable<any> {
  return this.http.get<any[]>(`${this.apiUrl}/parent/${parentId}/enfants`);
}



  affecterProfesseur(data: { professeurId: number, classesIds: number[] }): Observable<any> {
    return this.http.post(`${this.profUrl}/affecterClasses`, data);
  }


getProfesseurs(): Observable<any[]> {
  return this.http.get<any[]>(this.profUrl);
}
getElevesByProf(profId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eleves/prof/${profId}`);
  }



  changeUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role: newRole });
  }

}
