import { Component, OnInit } from '@angular/core';
import { OuvrierService } from '../../services/ouvrier.service';
import { AuthService } from '../../services/auth.service';
import { Ouvrier } from '../../models/ouvrier';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ouvrier-settings',
  templateUrl: './ouvrier-settings.component.html',
  styleUrls: ['./ouvrier-settings.component.css']
})
export class OuvrierSettingsComponent implements OnInit {
  ouvrier: Ouvrier | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  credentialsForm: FormGroup;
  isEditing: boolean = false; 

  constructor(
    private ouvrierService: OuvrierService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.credentialsForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newLogin: [''],
      newPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadOuvrierSettings();
  }

  loadOuvrierSettings(): void {
    const ouvrierId = this.authService.getOuvrierId();
    if (ouvrierId) {
      this.ouvrierService.getOuvrierSettings(ouvrierId).subscribe(
        (data: Ouvrier) => {
          this.ouvrier = data;
        },
        error => {
          this.errorMessage = 'Erreur lors du chargement des paramètres. Veuillez réessayer plus tard.';
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      );
    } else {
      this.errorMessage = 'Identifiant ouvrier non trouvé.';
    }
  }

  getImageUrl(photoPath: string | null | undefined): string {
    if (photoPath) {
      return `http://localhost:3000/${photoPath}`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.credentialsForm.valid) {
      const ouvrierId = this.authService.getOuvrierId();
      if (ouvrierId) {
        const { currentPassword, newLogin, newPassword } = this.credentialsForm.value;
        this.ouvrierService.updateOuvrierCredentials(ouvrierId, currentPassword, newLogin, newPassword)
          .subscribe(
            () => {
              this.successMessage = 'Identifiants mis à jour avec succès';
              this.errorMessage = '';
              this.credentialsForm.reset();
              this.isEditing = false;  
            },
            error => {
              this.errorMessage = error.error.message || 'Erreur lors de la mise à jour des identifiants';
              this.successMessage = '';
            }
          );
      }
    }
  }
  
  
}
