import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
}
