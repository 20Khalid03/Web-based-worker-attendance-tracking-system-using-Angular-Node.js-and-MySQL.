import { Component, OnInit, OnDestroy } from '@angular/core';
import { OuvrierService } from '../../services/ouvrier.service';
import { PointageService } from '../../services/pointage.service';
import { Ouvrier } from '../../models/ouvrier';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  ouvriers: Ouvrier[] = [];
  filteredOuvriers: Ouvrier[] = [];
  paginatedOuvriers: Ouvrier[] = [];
  pointages: Map<number, any> = new Map();
  userName: string | null = null;

  searchTerm: string = '';
  itemsPerPage: number = 5; 
  currentPage: number = 1;
  totalPages: number = 1;
  startIndex: number = 0;
  endIndex: number = 0;

  private pointageSubscription: Subscription | undefined;

  constructor(
    private ouvrierService: OuvrierService,
    private pointageService: PointageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.loadOuvriers();
    this.pointageSubscription = this.pointageService.getPointageState().subscribe(state => {
      this.pointages = state;
    });
  }

  ngOnDestroy(): void {
    if (this.pointageSubscription) {
      this.pointageSubscription.unsubscribe();
    }
  }

  loadOuvriers(): void {
    this.ouvrierService.getAllOuvriers().subscribe({
      next: (data: Ouvrier[]) => {
        this.ouvriers = data;
        this.filteredOuvriers = [...this.ouvriers];
        this.updatePagination();
      },
      error: err => console.error('Erreur de récupération des ouvriers :', err)
    });
  }

  search(): void {
    this.filteredOuvriers = this.ouvriers.filter(ouvrier => 
      ouvrier.First_Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      ouvrier.Last_Name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
    this.updatePagination();
  }
  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredOuvriers.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredOuvriers.length);
    this.paginatedOuvriers = this.filteredOuvriers.slice(this.startIndex, this.endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }


  handleCardClick(ouvrier: Ouvrier): void {
    if (ouvrier.id === undefined) {
      console.error('ID de l\'ouvrier non défini');
      return;
    }
    
    const ouvrierId = ouvrier.id;
    const pointages = this.pointages.get(ouvrierId) || [];
    const dernierPointage = pointages.length > 0 ? pointages[pointages.length - 1] : null;

    if (!dernierPointage || dernierPointage.sortie) {
      this.pointageService.enregistrerEntree(ouvrierId).subscribe();
    } else if (dernierPointage.entree && !dernierPointage.sortie) {
      this.pointageService.enregistrerSortie(ouvrierId).subscribe();
    }
  }
  
  getStatut(ouvrierId: number | undefined): string {
    if (ouvrierId === undefined) return 'Non pointé';
    const pointages = this.pointages.get(ouvrierId) || [];
    if (pointages.length === 0) return 'Non pointé';
    
    const dernierPointage = pointages[pointages.length - 1];
    if (!dernierPointage.entree) return 'Non pointé';
    if (!dernierPointage.sortie) return 'Entrée';
    return 'Sortie';
  }
  
  getCardClass(ouvrierId: number): string {
    const statut = this.getStatut(ouvrierId);
    if (statut === 'Non pointé') return 'card-initial';
    if (statut === 'Entrée') return 'card-entree';
    if (statut === 'Sortie') return 'card-sortie';
    return '';
  }

  getImageUrl(photoPath: string | null | undefined): string {
    if (photoPath) {
      return `http://localhost:3000/${photoPath}`;
    }
    return '';
  }

  repointer(): void {
    this.pointageService.resetAllPointages();
    this.ouvriers.forEach(ouvrier => {
      if (ouvrier.id !== undefined) {
        this.pointageService.preparerNouveauPointage(ouvrier.id).subscribe({
          error: (err) => console.error(`Erreur lors de la préparation d'un nouveau pointage pour l'ouvrier ${ouvrier.id}:`, err)
        });
      }
    });
  }
}