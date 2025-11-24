import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

//  Interface Notification
export interface Notification {
  id: number;
  user_id: number;
  element_lie_id?: number;
  type_element_lie?: string;
  type: string;
  texte: string;
  statut: 'non_lu' | 'lu';
  created_at?: string;
  updated_at?: string;
  lu: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

// URL de base de ton API Laravel
   private apiUrl =  `${environment.apiUrl}/notifications`
  constructor(private http: HttpClient) {}

  // Récupérer toutes les notifications d'un utilisateur
  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Marquer une notification comme lue
  marquerCommeLu(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-read/${notificationId}`, {});
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  marquerToutesCommeLues(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read/${userId}`, {});
  }
}
