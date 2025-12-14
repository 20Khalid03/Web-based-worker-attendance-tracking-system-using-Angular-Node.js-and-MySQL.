import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utilisateur } from '../../models/utilisateurs';
import { UserService } from '../../services/userservice.service';
import { AuthService } from '../../services/auth.service';
import { timer } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css']
})
export class UtilisateursComponent implements OnInit {
  @ViewChild('addUserModal') addUserModal!: ElementRef;
  @ViewChild('editUserModal') editUserModal!: ElementRef;

  utilisateurDetail!: FormGroup;
  utilisateurList: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  searchText: string = '';
  userName: string | null = null;
  alertMessage: string = '';
  showAlert: boolean = false;
  alertType: 'success' | 'danger' = 'success';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.initForm();
    this.getAllUtilisateurs();
  }

  initForm(): void {
    this.utilisateurDetail = this.formBuilder.group({
      id: [''],
      login: ['', Validators.required],
      password: ['', Validators.required],
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      E_mail: ['', [Validators.required, Validators.email]]
    });
  }

  getAllUtilisateurs(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.utilisateurList = res;
        this.filteredUtilisateurs = res;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
        this.showCustomAlert('Erreur lors de la récupération des utilisateurs', 'danger');
      }
    });
  }

  filterUtilisateurs(): void {
    this.filteredUtilisateurs = this.utilisateurList.filter(utilisateur =>
      utilisateur.First_Name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  editUtilisateur(utilisateur: Utilisateur): void {
    this.utilisateurDetail.patchValue({
      id: utilisateur.id,
      login: utilisateur.login,
      password: utilisateur.password,
      First_Name: utilisateur.First_Name,
      Last_Name: utilisateur.Last_Name,
      E_mail: utilisateur.E_mail
    });
    this.openModal(this.editUserModal);
  }

addUtilisateur(): void {
  if (this.utilisateurDetail.valid) {
    const userData = this.utilisateurDetail.value;
    this.isLoading = true;
    this.userService.addUser(userData).subscribe({
      next: (res) => {
        this.showCustomAlert('Utilisateur ajouté avec succès', 'success');
        this.getAllUtilisateurs();
        this.utilisateurDetail.reset(); 
        this.closeModal(this.addUserModal); 
      },
      error: (err) => {
        this.showCustomAlert('Erreur lors de l\'ajout de l\'utilisateur: ' + err.error.message, 'danger');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  } else {
    this.showCustomAlert('Veuillez remplir tous les champs correctement.', 'danger');
  }
}

updateUtilisateur(): void {
  if (this.utilisateurDetail.valid) {
    const id = this.utilisateurDetail.value.id;
    this.isLoading = true;
    this.userService.updateUser(id, this.utilisateurDetail.value).subscribe({
      next: (res) => {
        this.showCustomAlert('Utilisateur mis à jour avec succès', 'success');
        this.getAllUtilisateurs();
        this.utilisateurDetail.reset();
        this.closeModal(this.editUserModal); 
      },
      error: (err) => {
        this.showCustomAlert('Erreur lors de la mise à jour de l\'utilisateur', 'danger');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  } else {
    this.showCustomAlert('Veuillez remplir tous les champs correctement.', 'danger');
  }
}

closeModal(modalElement: ElementRef): void {
  const modal = bootstrap.Modal.getInstance(modalElement.nativeElement);
  if (modal) {
    modal.hide();
  }
}


  deleteUtilisateur(id: number | undefined): void {
    if (id !== undefined) {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?');
      if (confirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            console.log('Utilisateur supprimé avec succès');
            this.showCustomAlert('Utilisateur supprimé avec succès', 'success');
            this.getAllUtilisateurs();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'utilisateur', err);
            this.showCustomAlert('Erreur lors de la suppression de l\'utilisateur', 'danger');
          }
        });
      } else {
        console.log('Suppression annulée');
      }
    } else {
      console.error('ID de l\'utilisateur non défini');
      this.showCustomAlert('ID de l\'utilisateur non défini', 'danger');
    }
  }

  showCustomAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  openModal(modalElement: ElementRef): void {
    const modal = new bootstrap.Modal(modalElement.nativeElement);
    modal.show();
  }

  

  scrollToBottom(): void {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
