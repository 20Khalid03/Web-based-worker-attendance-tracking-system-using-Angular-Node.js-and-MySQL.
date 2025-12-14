import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Ouvrier } from '../models/ouvrier';

@Injectable({
  providedIn: 'root'
})
export class OuvrierService {
  private apiUrl = 'http://localhost:3000/ouvriers';

  constructor(private http: HttpClient) { }

  addOuvrier(ouvrier: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addOuvrier`, ouvrier);
  }

  getAllOuvriers(): Observable<Ouvrier[]> {
    return this.http.get<Ouvrier[]>(`${this.apiUrl}/getAllOuvriers`);
  }

  updateOuvrier(id: number, ouvrier: FormData): Observable<Ouvrier> {
    return this.http.put<Ouvrier>(`${this.apiUrl}/updateOuvrier/${id}`, ouvrier);
  }

  getOuvrierById(id: number): Observable<Ouvrier> {
    return this.http.get<Ouvrier>(`${this.apiUrl}/ouvriers/${id}`);
  }

  deleteOuvrier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteOuvrier/${id}`);
  }

  checkIfOuvrierExists(CIN: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?CIN=${CIN}`);
  }

  getOuvrierInformation(ouvrierId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/informations/${ouvrierId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des informations de l\'ouvrier:', error);
        return throwError(error);
      })
    );
  }
  
  getHeuresTravaillees(ouvrierId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/heures-travaillees/${ouvrierId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des heures travaillées:', error);
        return throwError(error);
      })
    );
  }

  getHeuresParJour(ouvrierId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/heures-par-jour/${ouvrierId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des heures par jour:', error);
        return throwError(error);
      })
    );
  }

  getOuvrierSettings(ouvrierId: number): Observable<Ouvrier> {
    return this.http.get<Ouvrier>(`${this.apiUrl}/settings/${ouvrierId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des paramètres de l\'ouvrier:', error);
        return throwError(() => new Error(error));
      })
    );
  }
  updateOuvrierCredentials(ouvrierId: number, currentPassword: string, newLogin?: string, newPassword?: string): Observable<any> {
    const url = `${this.apiUrl}/settings/credentials/${ouvrierId}`;
    const body = { currentPassword, newLogin, newPassword };
    return this.http.put(url, body).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la mise à jour des identifiants:', error);
        return throwError(() => new Error(error));
      })
    );
  }
 
  getOuvrierAbsences(ouvrierId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/absences/${ouvrierId}`).pipe(
      catchError((error: any) => {
        console.error('Erreur lors de la récupération des absences de l\'ouvrier:', error);
        return throwError(error);
      })
    );
  }
}