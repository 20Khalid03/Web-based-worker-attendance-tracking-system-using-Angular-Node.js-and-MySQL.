import { Injectable } from '@angular/core';
import { PointageService } from './pointage.service';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(private pointageService: PointageService) {}

  startSync(): void {
    timer(0, 86400000).pipe(
      switchMap(() => this.pointageService.getPointages())
    ).subscribe({
      next: () => console.log('Synchronisation des pointages effectuée'),
      error: err => console.error('Erreur lors de la synchronisation des pointages', err)
    });
  }
}