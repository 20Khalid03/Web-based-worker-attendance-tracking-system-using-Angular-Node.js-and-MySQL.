import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3000/api/visualisation';

  constructor(private http: HttpClient) {}

  getWorkersReport(start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/workers-report`, { params: { start, end } });
  }
}
