import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  utilisateur: any;
  settingsForm: FormGroup;
  isEditing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService
  ) {
    this.settingsForm = this.fb.group({
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      E_mail: ['', [Validators.required, Validators.email]],
      telephone: [''],
      login: ['', Validators.required],
      newPassword: [''],
      confirmPassword: ['']
    }, { validator: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.utilisateurService.getUserSettings().subscribe(
      data => {
        this.utilisateur = data;
        this.settingsForm.patchValue(data);
      },
      error => {
        if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès non autorisé. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des informations de l\'utilisateur.';
        }
        console.error('Erreur lors du chargement des informations:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const userData = { ...this.settingsForm.value };
    
    if (userData.newPassword) {
      if (userData.newPassword !== userData.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        return;
      }
    } else {
      delete userData.newPassword;
      delete userData.confirmPassword;
    }

    delete userData.confirmPassword;

    this.utilisateurService.updateUserSettings(userData).subscribe(
      response => {
        this.successMessage = 'Paramètres mis à jour avec succès.';
        this.errorMessage = '';
        this.isEditing = false;
        this.loadUserInfo();
      },
      error => {
        if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès non autorisé. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors de la mise à jour des paramètres.';
        }
        this.successMessage = '';
        console.error('Erreur lors de la mise à jour des paramètres:', error);
      }
    );
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.settingsForm.patchValue(this.utilisateur);
    this.errorMessage = '';
    this.successMessage = '';
  }

  private passwordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { 'passwordMismatch': true } : null;
  }

  get passwordMismatch(): boolean {
    return this.settingsForm.hasError('passwordMismatch');
  }
}