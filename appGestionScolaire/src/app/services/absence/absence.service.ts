import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {

private apiUrl =`${environment.apiUrl}/absences`;

  constructor(private http: HttpClient) {}

  marquerAbsence(absenceData: any): Observable<any> {
    return this.http.post(this.apiUrl, absenceData);
  }

  getAbsencesByClasse(classeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?classe_id=${classeId}`);
  }

getAbsencesByEleve(eleveId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/eleve/${eleveId}`);
}
getAbsencesParParent(parentId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/parent/${parentId}`);
}


  justifierAbsence(absenceId: number, justificatif: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${absenceId}/justifier`, justificatif);
  }
   // Nouvelle méthode pour récupérer le taux d'absences par classe
  getTauxAbsences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taux`);
  }
   getAbsencesByProf(profId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/absences/prof/${profId}`);
  }

// Dans absence.service.ts
getAbsencesDuJour(date: string, matiereId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/du-jour`, {
    params: { date, matiere_id: matiereId.toString() }
  });
}

supprimerAbsence(eleveId: number, date: string, matiereId: number) {
  return this.http.delete(`${this.apiUrl}`, {
    params: {
      eleve_id: eleveId.toString(),
      date_absence: date,
      matiere_id: matiereId.toString()
    }
  });
}
}
