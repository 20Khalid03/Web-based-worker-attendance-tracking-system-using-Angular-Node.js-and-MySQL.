import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbsentService {
  private apiUrl = 'http://localhost:3000/api/pointage';

  constructor(private http: HttpClient) { }

  getAbsents(date?: string): Observable<any> {
    let url = `${this.apiUrl}/absents`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.http.get(url);
  }
}