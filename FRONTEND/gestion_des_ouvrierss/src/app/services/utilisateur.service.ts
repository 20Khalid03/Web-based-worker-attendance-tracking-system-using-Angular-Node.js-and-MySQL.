import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(utilisateur: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, utilisateur).pipe(
      tap((response: any) => {
        if (response && response.userId) {
          localStorage.setItem('userId', response.userId);
        }
      })
    );
  }

  getUserSettings(): Observable<any> {
    const userId = localStorage.getItem('userId');
    return this.http.get(`${this.apiUrl}/settings/${userId}`);
  }

  updateUserSettings(userData: any): Observable<any> {
    const userId = localStorage.getItem('userId');
    return this.http.put(`${this.apiUrl}/settings/${userId}`, userData);
  }

  logout(): void {
    localStorage.removeItem('userId');
  }
}