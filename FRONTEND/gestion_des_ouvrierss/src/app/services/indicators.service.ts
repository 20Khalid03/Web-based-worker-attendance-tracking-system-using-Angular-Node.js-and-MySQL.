import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  private apiUrl = 'http://localhost:3000/api/indicators';

  constructor(private http: HttpClient) {}

  private formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getHoursWorked(startDate: string, endDate: string): Observable<any> {
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    return this.http.get<any>(`${this.apiUrl}/hours-worked?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
  }

  getAverageHoursWorked(startDate: string, endDate: string): Observable<any> {
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    return this.http.get<any>(`${this.apiUrl}/average-hours-worked?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
  }

  getDaysWorked(startDate: string, endDate: string): Observable<any> {
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    return this.http.get<any>(`${this.apiUrl}/days-worked?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
  }
}