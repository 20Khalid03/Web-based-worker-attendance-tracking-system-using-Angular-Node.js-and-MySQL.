import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ouvrier } from '../models/ouvrier';

@Injectable({
  providedIn: 'root'
})
export class DashboardouvrierService {
  private apiUrl = 'http://localhost:3000/ouvriers';

  constructor(private http: HttpClient) {}

  getAllOuvriers(): Observable<Ouvrier[]> {
    return this.http.get<Ouvrier[]>(`${this.apiUrl}/getAllOuvriers`);
  }

  getHeuresTravalleesParOuvrier(ouvrierId: number): Observable<{ totalHoursWorked: string, details: any[] }> {
    return this.http.get<{ totalHoursWorked: string, details: any[] }>(`${this.apiUrl}/heures-travaillees/${ouvrierId}`);
  }
  
  getTopOuvriers(): Observable<{ name: string, heures: number }[]> {
    return this.http.get<{ name: string, heures: number }[]>(`${this.apiUrl}/getTopOuvriers`);
  }
}