import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Classe } from '../../models/classe.model';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {

  private apiUrl = environment.apiUrl; // correction : fermeture de la chaîne

  constructor(private http: HttpClient) { }

  // Récupérer toutes les classes
  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classes`);
  }

  // Récupérer toutes les matières
  getMatieres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matieres`);
  }
 // Récupérer les classes d’un professeur spécifique
  getClassesDuProfesseur(professeurId: number): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.apiUrl}/classes/prof/${professeurId}`);
  }



  // Nouvelle méthode pour récupérer la performance par classe
  getPerformanceClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classes/performance`);
  }

  getClassesByProf(profId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classes/prof/${profId}`);
  }
}
