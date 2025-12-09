import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// AJOUTEZ CECI :
interface NumeroEvaluation {
  numero: number;
  estDisponible: boolean;
  existeDeja: boolean;
}
export interface NoteData {
  classe_id: number;
  eleve_id: number;
  matiere_id: number;
  type: string;
  valeur: number;
  periode: string;
  commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private apiUrl = 'http://localhost:8000/api/notes';

  constructor(private http: HttpClient) {}
getAllNotes(): Observable<any> {
  return this.http.get(`${this.apiUrl}/all`);
}
  attribuerNote(note: NoteData): Observable<any> {
    return this.http.post(`${this.apiUrl}/attribuer`, note);
  }

  getNotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  supprimerNote(noteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${noteId}`);
  }

  modifierNote(noteId: number, note: NoteData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${noteId}`, note);
  }

  getNotesParEleve(eleveId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/eleve/${eleveId}`);
  }

  getNotesParParent(parentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/parent/${parentId}`);
  }

  getNotesByProf(profId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notes/prof/${profId}`);
  }


  // NOUVELLE MÉTHODE 1: Attribution en masse
  attribuerNotesBulk(bulkData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, bulkData);
  }

  // NOUVELLE MÉTHODE 2: Récupérer les élèves avec leurs notes
 getElevesAvecNotes(classeId: number, matiereId: number, type: string, periode: string, numero?: number) {
  let url = `${this.apiUrl}/eleves/${classeId}/${matiereId}`;
  let params = new HttpParams()
    .set('type', type)
    .set('periode', periode);

  if (numero !== undefined && numero !== null) {
    params = params.set('numero', numero.toString());
  }

  return this.http.get<any[]>(url, { params });
}


  getNumerosDisponibles(classeId: number, matiereId: number, type: string, periode: string) {
  return this.http.get<NumeroEvaluation[]>(
    `${this.apiUrl}/notes/numeros-disponibles`,
    {
      params: {
        classe_id: classeId.toString(),
        matiere_id: matiereId.toString(),
        type: type,
        periode: periode
      }
    }
  );
}


// notes.service.ts
updateBulkNotes(notesData: Array<{
  note_id: number;
  valeur: number;
  commentaire?: string;
}>): Observable<any> {
  return this.http.put(`${this.apiUrl}/bulk-update`, { notes: notesData });
}
  // MÉTHODE NOUVELLE : Récupérer les notes par filtre complet
  getNotesByFiltre(classeId: number, matiereId: number, type?: string, periode?: string, numero?: number): Observable<any> {
    let params = new HttpParams()
      .set('classe_id', classeId.toString())
      .set('matiere_id', matiereId.toString());

    if (type) params = params.set('type', type);
    if (periode) params = params.set('periode', periode);
    if (numero) params = params.set('numero', numero.toString());

    return this.http.get(`${this.apiUrl}/filter`, { params });
  }

  // MÉTHODE NOUVELLE : Supprimer une note
  deleteNote(noteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${noteId}`);
  }







 // Dans notes.service.ts
updateNotesBulk(notesData: Array<{note_id: number, valeur: number, commentaire?: string}>): Observable<any> {
  return this.http.put(`${this.apiUrl}/bulk-update`, { notes: notesData });
}
}
