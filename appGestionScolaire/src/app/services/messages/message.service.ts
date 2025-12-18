import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ✅ Modèle de message (tu peux aussi le mettre dans /models/message.model.ts)
export interface Message {

  id?: number;
  objet: string;
  contenu: string;
  type: string;
  statut: string;
  expediteur_id: number;
  destinataire_id?: number;
  classe_id?: number;
  created_at: string;
  expediteur_type?: string; // Ajouter cette propriété
  role_destinataire?: string; // Ajouter cette propriété
  statut_admin?: string; // Ajouter cette propriété
  expediteur_nom?: string; // Ajoutez cette ligne
  expediteur_prenom?: string; // Ajoutez cette ligne si nécessaire
  priorite?: string; // Ajouter cette propriété
  role_expediteur?: string; // Ajouter cette propriété
 }


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl =  `${environment.apiUrl}/messages`


  constructor(private http: HttpClient) {}

  /**
   * 📩 Récupérer tous les messages (Admin ou global)
   */
  getAll(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  /**
   * 📥 Récupérer les messages reçus par un utilisateur donné
   */
  getReceived(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/received/${userId}`);
  }

  /**
   * 📤 Récupérer les messages envoyés par un utilisateur donné
   */
  getSent(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/sent/${userId}`);
  }


  /**
   * 📝 Envoyer un nouveau message
   */
  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  /**
   * ✅ Marquer un message comme lu
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  /**
   * ❌ Supprimer un message
   */
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** * 🔍 Rechercher des messages par mot-clé dans l'objet ou le contenu
   */
  searchMessages(userId: number, term: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/search/${userId}?q=${term}`);
  }

  sendToClasse(classeId: number, message: Message): Observable<any> {
    return this.http.post(`${this.apiUrl}/classe/${classeId}`, message);
  }

  sendToAllStudents(message: Message): Observable<any> {
    return this.http.post(`${this.apiUrl}/all-students`, message);
  }
  followUpRequest(messageId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${messageId}/follow-up`, {   });
  }

 getMessagesForParent() {
  // Implémentez votre logique réelle ici
  // Pour l'instant, retournez un Observable vide ou mock
  return of([] as Message[]); // Exemple avec Observable
}

sendMessageAsParent(formData: FormData) {
  // Implémentez votre logique réelle ici
  // Pour l'instant, retournez un Observable vide ou mock
  return of({} as Message); // Exemple avec Observable
}
  }

