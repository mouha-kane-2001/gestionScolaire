import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ConvocationService {

    constructor(private http: HttpClient) {} // ⬅️ AJOUTEZ CE CONSTRUCTOR

  private baseUrl = `${environment.apiUrl}/convocations`;

  createConvocation(convocationData: any): Observable<any> {
    return this.http.post(this.baseUrl, convocationData);
  }

  getConvocationsByEleve(eleveId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/eleve/${eleveId}`);
  }

  getConvocationsByParent(parentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/parent/${parentId}`);
  }

  markAsRead(convocationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${convocationId}/read`, {});
  }
getAllConvocations(): Observable<any> {
  return this.http.get(this.baseUrl);
}

}
