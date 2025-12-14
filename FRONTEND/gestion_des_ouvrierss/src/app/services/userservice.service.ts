import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateurs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private Url = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.Url}/getallusers`);
  }

  addUser(user: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.Url}/adduser`, user);
  }

  updateUser(id: number, user: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.Url}/updateuser/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.Url}/deleteuser/${id}`);
  }

  login(utilisateur: any): Observable<any> {
    return this.http.post(`${this.Url}/login`, utilisateur);
  }
}