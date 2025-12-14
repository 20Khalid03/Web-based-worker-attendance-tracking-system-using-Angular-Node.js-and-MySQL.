import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isAuthenticated = false;
  private userName: string | null = null;
  private userRole: string | null = null;
  private userId: number | null = null;
  private ouvrierId: number | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isAuthenticated = true;
      this.userRole = localStorage.getItem('userRole');
      this.userName = localStorage.getItem('userName');
      this.userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!, 10) : null;
      this.ouvrierId = localStorage.getItem('ouvrierId') ? parseInt(localStorage.getItem('ouvrierId')!, 10) : null;
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { login: username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', response.role);
          localStorage.setItem('userName', username);
          
          if (response.userId) {
            localStorage.setItem('userId', response.userId.toString());
            this.userId = response.userId;
          } else {
            console.error('userId is undefined');
          }
      
          if (response.ouvrierId) {
            localStorage.setItem('ouvrierId', response.ouvrierId.toString());
            this.ouvrierId = response.ouvrierId;
          } else {
            console.error('ouvrierId is undefined');
          }
      
          this.isAuthenticated = true;
          this.userName = username;
          this.userRole = response.role;
      
          this.redirectToDashboard();
        }
      })
      
    );
  }
  
  getUserId(): number | null {
    return this.userId;
  }

  getOuvrierId(): number | null {
    return this.ouvrierId;
  }
  

  logout(): void {
    this.isAuthenticated = false;
    this.userName = null;
    this.userRole = null;
    this.userId = null;
    this.ouvrierId = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('ouvrierId');

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserName(): string | null {
    return this.userName;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  redirectToDashboard(): void {
    if (this.userRole === 'admin') {
      this.router.navigate(['/dashboard']);
    } else if (this.userRole === 'ouvrier') {
      this.router.navigate(['/dashboard-ouvrier']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  

  validateToken(): boolean {
    const token = this.getToken();
    if (token) {
      return true;  
    }
    return false;
  }
}
