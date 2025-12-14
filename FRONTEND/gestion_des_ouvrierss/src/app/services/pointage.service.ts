import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private baseUrl = 'http://localhost:3000/api/pointage';
  private pointageSubject = new Subject<any>();
  pointageObservable = this.pointageSubject.asObservable();

  private pointagesState = new BehaviorSubject<Map<number, any>>(new Map());

  constructor(private http: HttpClient) {
    this.loadInitialState();
  }
  private loadInitialState() {
    this.getPointages().subscribe(pointages => {
      const state = new Map<number, any>();
      pointages.forEach(p => {
        if (p.date_heure_entree) {
          if (!state.has(p.ouvrier_id)) {
            state.set(p.ouvrier_id, []);
          }
          const pointagesOuvrier = state.get(p.ouvrier_id);
          pointagesOuvrier.push({
            entree: p.date_heure_entree ? new Date(p.date_heure_entree) : null,
            sortie: p.date_heure_sortie ? new Date(p.date_heure_sortie) : null
          });
        }
      });
      this.pointagesState.next(state);
    });
  }

  getPointages(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  enregistrerEntree(ouvrierId: number): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.baseUrl}/entree/${ouvrierId}`, {}).subscribe({
        next: (response: any) => {
          const currentState = this.pointagesState.value;
          const pointages = currentState.get(ouvrierId) || [];
          pointages.push({ entree: new Date(response.date_heure_entree), sortie: null });
          currentState.set(ouvrierId, pointages);
          this.pointagesState.next(currentState);
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  enregistrerSortie(ouvrierId: number): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.baseUrl}/sortie/${ouvrierId}`, {}).subscribe({
        next: (response: any) => {
          const currentState = this.pointagesState.value;
          const pointages = currentState.get(ouvrierId) || [];
          if (pointages.length > 0 && pointages[pointages.length - 1].sortie === null) {
            pointages[pointages.length - 1].sortie = new Date(response.date_heure_sortie);
          } else {
            pointages.push({ entree: null, sortie: new Date(response.date_heure_sortie) });
          }
          currentState.set(ouvrierId, pointages);
          this.pointagesState.next(currentState);
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  resetAffichagePointages() {
    this.pointageSubject.next('reset');
  }

  getPointageState(): Observable<Map<number, any>> {
    return this.pointagesState.asObservable();
  }


  
  notifyPointageUpdate(pointage: any) {
    this.pointageSubject.next(pointage);
  }

  updatePointage(pointage: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${pointage.id}`, pointage);
  }

  deletePointage(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  deletePointagesByDate(date: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/date/${date}`);
  }
  resetAllPointages(): void {
    this.pointagesState.next(new Map());
  }

  preparerNouveauPointage(ouvrierId: number): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.baseUrl}/preparer-nouveau/${ouvrierId}`, {}).subscribe({
        next: (response: any) => {
          const currentState = this.pointagesState.value;
          currentState.set(ouvrierId, []);
          this.pointagesState.next(currentState);
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

}
