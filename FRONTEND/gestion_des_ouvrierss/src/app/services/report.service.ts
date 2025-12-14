import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = 'http://localhost:3000/visualisation/worker-report'; 

  constructor(private http: HttpClient) { }

  getWorkerReport(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
