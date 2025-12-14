import { Component, OnInit, AfterViewInit } from '@angular/core';
import { toggleSidebar, animateCards, filterTable,animateButtons,initSidebarLinks } from './dashbord.component';
import { PointageService } from '../../services/pointage.service';
import { AuthService } from '../../services/auth.service';
import { IndicatorsService } from '../../services/indicators.service';
import moment from 'moment-timezone';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;
  pointagesParJour: Map<string, any[]> = new Map();
  selectedDate: Date = new Date();
  selectedDateString: string = this.formatDate(this.selectedDate);
  searchDate: string = '';
  totalHoursWorked: number = 0;
  avgHoursWorked: number = 0;
  totalDaysWorked: number = 0;
  startDate: string = '';
  endDate: string = '';

  constructor(
    private authService: AuthService, 
    private pointageService: PointageService,
    private indicatorsService: IndicatorsService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.loadPointages();
    this.pointageService.pointageObservable.subscribe(() => {
      this.loadPointages();
    });
  }
  ngAfterViewInit() {
    toggleSidebar();
    animateCards();
    filterTable();
    animateButtons();
    initSidebarLinks();
  }
  loadPointages() {
    this.pointageService.getPointages().subscribe(
      data => {
        this.pointagesParJour.clear();
        data.forEach(pointage => {
          pointage.isEditing = false;
  
          const date = new Date(pointage.date_heure_entree).toDateString();
          if (!this.pointagesParJour.has(date)) {
            this.pointagesParJour.set(date, []);
          }
          this.pointagesParJour.get(date)?.push(pointage);
        });
  
        this.selectedDateString = this.searchDate ? new Date(this.searchDate).toDateString() : this.formatDate(this.selectedDate);
      },
      error => {
        console.error('Erreur lors du chargement des pointages:', error);
      }
    );
  }
  
  loadIndicators() {
    if (!this.startDate || !this.endDate) {
      console.error('Veuillez sélectionner une date de début et une date de fin');
      return;
    }
  
    this.indicatorsService.getHoursWorked(this.startDate, this.endDate).subscribe(
      data => {
        this.totalHoursWorked = data.reduce((sum: number, current: any) => sum + Number(current.total_hours), 0);
      },
      error => {
        console.error('Erreur lors du chargement des heures travaillées:', error);
      }
    );
  
    this.indicatorsService.getAverageHoursWorked(this.startDate, this.endDate).subscribe(
      data => {
        this.avgHoursWorked = data.length > 0 ? data.reduce((sum: number, current: any) => sum + Number(current.avg_hours), 0) / data.length : 0;
      },
      error => {
        console.error('Erreur lors du chargement des heures moyennes travaillées:', error);
      }
    );
  
    this.indicatorsService.getDaysWorked(this.startDate, this.endDate).subscribe(
      data => {
        this.totalDaysWorked = data.reduce((sum: number, current: any) => sum + Number(current.days_worked), 0);
      },
      error => {
        console.error('Erreur lors du chargement des jours travaillés:', error);
      }
    );
  }
  
  formatDate(date: Date): string {
    return new Date(date).toDateString();
  }

  changeDate(dayOffset: number) {
    this.selectedDate = moment(this.selectedDate).add(dayOffset, 'days').toDate();
    this.selectedDateString = this.formatDate(this.selectedDate);
    this.searchDate = ''; 
    this.loadPointages(); 
  }

  searchByDate() {
    console.log('searchByDate called with searchDate:', this.searchDate);
    if (this.searchDate) {
      const formattedSearchDate = new Date(this.searchDate).toDateString();
      if (this.pointagesParJour.has(formattedSearchDate)) {
        this.selectedDate = new Date(this.searchDate);
        this.selectedDateString = formattedSearchDate;
        this.loadPointages(); 
      } else {
        console.log('Aucun pointage trouvé pour cette date.');
      }
    }
  }
  

  editPointage(pointage: any) {
    pointage.isEditing = true;
  }
  

  savePointage(pointage: any): void {
    const updatedPointage = {
      ...pointage,
      date_heure_entree: this.convertToDate(pointage.editedDateHeureEntree),
      date_heure_sortie: pointage.editedDateHeureSortie ? this.convertToDate(pointage.editedDateHeureSortie) : null
    };

    this.pointageService.updatePointage(updatedPointage).subscribe(() => {
      pointage.isEditing = false;
      this.loadPointages();
    });
  }

  cancelEdit(pointage: any) {
    pointage.isEditing = false;
  }
  

  deletePointage(pointageId: number) {
    this.pointageService.deletePointage(pointageId).subscribe(
      () => {
        this.loadPointages();
      },
      error => {
        console.error('Erreur lors de la suppression du pointage:', error);
      }
    );
  }

  private convertToDate(timeStr: string): Date {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time string:', timeStr);
      return now;
    }

    now.setHours(hours, minutes);
    return now;
  }

  deletePointagesOfToday() {
    const today = moment().format('YYYY-MM-DD');
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les pointages d\'aujourd\'hui ?')) {
      this.pointageService.deletePointagesByDate(today).subscribe(
        () => {
          alert('Tous les pointages d\'aujourd\'hui ont été supprimés avec succès.');
          this.loadPointages(); 
        },
        error => {
          console.error('Erreur lors de la suppression des pointages :', error);
          alert('Une erreur est survenue lors de la suppression des pointages.');
        }
      );
    }
  }
  

  logout(): void {
    this.authService.logout();
  }
}
export { toggleSidebar };

