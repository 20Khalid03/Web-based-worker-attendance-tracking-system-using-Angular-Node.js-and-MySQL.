import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { OuvrierService } from '../../services/ouvrier.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Ouvrier } from '../../models/ouvrier';
import { Chart, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-ouvrier',
  templateUrl: './dashboard-ouvrier.component.html',
  styleUrls: ['./dashboard-ouvrier.component.css']
})
export class DashboardOuvrierComponent implements OnInit, AfterViewInit {
  @ViewChild('columnChart') columnChartCanvas: ElementRef | undefined;
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef | undefined;

  ouvrierDetail!: FormGroup;
  ouvrierList: Ouvrier[] = [];
  ouvrierInfo: any;
  heuresTravaillees: any;
  userId: number | null = null;
  ouvrierId: number | null = null;
  userName: string | null = null;
  isLoading: boolean = true;
  dropdownVisible: boolean = false;
  columnChart: any;
  heuresParJour: any;
  absences: any;

  constructor(
    private ouvrierService: OuvrierService,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userId = this.authService.getUserId();
    this.ouvrierId = this.authService.getOuvrierId();

    if (!this.userName || !this.userId || !this.ouvrierId) {
      console.warn('Utilisateur non authentifié ou informations manquantes. Redirection vers la page de connexion.');
      this.logout();
      return;
    }

    this.getOuvrierInformation();
    this.getHeuresTravaillees();
    this.getHeuresParJour();
    this.getAbsences();
  }

  ngAfterViewInit(): void {
    if (this.heuresParJour) {
      this.createColumnChart();
    }
  }

  getOuvrierInformation(): void {
    if (this.ouvrierId) {
      this.ouvrierService.getOuvrierInformation(this.ouvrierId).subscribe(
        (data) => {
          this.ouvrierInfo = data;
          this.isLoading = false;
        },
        (error) => {
          console.error('Erreur lors de la récupération des informations :', error);
          this.isLoading = false;
        }
      );
    }
  }

  getHeuresTravaillees(): void {
    if (this.ouvrierId) {
      this.ouvrierService.getHeuresTravaillees(this.ouvrierId).subscribe(
        (data) => {
          this.heuresTravaillees = data;
        },
        (error) => {
          console.error('Erreur lors de la récupération des heures travaillées :', error);
        }
      );
    }
  }

  getHeuresParJour(): void {
    if (this.ouvrierId) {
      this.ouvrierService.getHeuresParJour(this.ouvrierId).subscribe(
        (data) => {
          this.heuresParJour = data;
          if (this.columnChartCanvas) {
            this.createColumnChart();
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des heures par jour :', error);
        }
      );
    }
  }

  createColumnChart(): void {
    if (this.columnChart) {
      this.columnChart.destroy();
    }

    if (this.heuresParJour && this.heuresParJour.length > 0 && this.columnChartCanvas) {
      const ctx = this.columnChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.columnChart = new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: this.heuresParJour.map((item: any) => item.date),
            datasets: [
              {
                label: 'Heures par jour',
                data: this.heuresParJour.map((item: any) => item.heures),
                backgroundColor: [
                  'rgba(255, 0, 0,0.6)',
                  'rgba(0, 0, 255, 0.6)',
                  'rgba(60, 179, 113, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(245, 40, 145, 0.8)',
                  'rgba(88, 215, 67, 1)',
                  'rgba(0, 0, 255, 0.89)',
                  'rgba(165, 255, 0, 0.89)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        console.error('Impossible d\'obtenir le contexte 2D pour le graphique en colonnes.');
      }
    } else {
      console.error('Données de "heuresParJour" non valides ou canvas non disponible pour la création du graphique en colonnes.');
    }
  }

  getAbsences(): void {
    if (this.ouvrierId) {
      this.ouvrierService.getOuvrierAbsences(this.ouvrierId).subscribe(
        (data) => {
          this.absences = data;
        },
        (error) => {
          console.error('Erreur lors de la récupération des absences :', error);
        }
      );
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownVisible = !this.dropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.dropdownMenu && !this.dropdownMenu.nativeElement.contains(event.target as Node)) {
      this.dropdownVisible = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToSettings(): void {
    this.router.navigate(['/ouvrier-settings']);
  }

  getImageUrl(photo: string): string {
    return `http://localhost:3000/${photo}`;
  }
}