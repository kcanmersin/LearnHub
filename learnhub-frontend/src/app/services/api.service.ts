import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(`${this.apiUrl}/token`, body.toString(), { headers });
  }

  getCurrentUser(token: string): Observable<any> {
     const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
     return this.http.get<any>(`${this.apiUrl}/users/me`, { headers });
  }

   createDefaultUser(): Observable<any> {
     return this.http.post<any>(`${this.apiUrl}/setup/create-default-user`, {});
   }

  getExplanation(data: { text: string, input_type: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/explanation`, data);
  }

  saveExplanation(saveData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, saveData);
  }

  getSavedQueries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/queries`);
  }

}
