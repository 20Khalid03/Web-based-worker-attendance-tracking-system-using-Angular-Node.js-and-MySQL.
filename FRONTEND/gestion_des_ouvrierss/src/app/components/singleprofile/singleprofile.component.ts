import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OuvrierService } from '../../services/ouvrier.service';
import { Ouvrier } from '../../models/ouvrier';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-single-profile',
  templateUrl: './singleprofile.component.html',
  styleUrls: ['./singleprofile.component.css']
})
export class SingleProfileComponent implements OnInit {
  ouvrier: Ouvrier | null = null;
  userName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ouvrierService: OuvrierService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOuvrier(+id);
    }
  }

  loadOuvrier(id: number): void {
    this.ouvrierService.getOuvrierById(id).subscribe({
      next: (ouvrier) => {
        this.ouvrier = ouvrier;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'ouvrier', error);
      }
    });
  }

  getImageUrl(photoPath: string | null | undefined): string {
    if (photoPath) {
      return `http://localhost:3000/${photoPath}`;
    }
    return '';
  }
}



