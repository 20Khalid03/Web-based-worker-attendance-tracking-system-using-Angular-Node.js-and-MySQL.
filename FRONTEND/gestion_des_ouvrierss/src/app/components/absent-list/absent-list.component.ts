import { Component, OnInit } from '@angular/core';
import { AbsentService } from '../../services/absent.service';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-absent-list',
  templateUrl: './absent-list.component.html',
  styleUrls: ['./absent-list.component.css']
})
export class AbsentListComponent implements OnInit {
  absents: any[] = [];
  userName: string | null = null;
  dateSearch = new FormControl<string | null>('');

  constructor(private absentService: AbsentService,private authService: AuthService) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.loadAbsents();
    this.dateSearch.valueChanges.subscribe(() => {
      this.loadAbsents();
    });
  }

  loadAbsents(): void {
    const searchDate = this.dateSearch.value;
    this.absentService.getAbsents(searchDate || undefined).subscribe(
      (data: any) => {
        this.absents = data;
      },
      error => {
        console.error('Erreur lors de la récupération des absents:', error);
      }
    );
  }
  
}