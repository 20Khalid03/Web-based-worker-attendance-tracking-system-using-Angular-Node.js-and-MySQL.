import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ouvrier } from '../../models/ouvrier';
import { OuvrierService } from '../../services/ouvrier.service';
import { AuthService } from '../../services/auth.service';
import { CustomAlertComponent } from '../custom-alert/custom-alert.component';

declare var bootstrap: any;

@Component({
  selector: 'app-ouvrier',
  templateUrl: './ouvrier.component.html',
  styleUrls: ['./ouvrier.component.css']
})
export class OuvrierComponent implements OnInit {
  @ViewChild('addEmployeeModal') addEmployeeModal!: ElementRef;
  @ViewChild('editEmployeeModal') editEmployeeModal!: ElementRef;
  
  ouvrierDetail!: FormGroup;
  ouvrierList: Ouvrier[] = [];
  filteredOuvriers: Ouvrier[] = [];
  searchText: string = '';
  selectedFile: File | null = null;
  userName: string | null = null;
  alertMessage: string = '';
  showAlert: boolean = false;
  alertType: 'success' | 'danger' = 'success';

  constructor(
    private formBuilder: FormBuilder,
    private ouvrierService: OuvrierService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.initForm();
    this.getAllOuvriers();
  }

  initForm(): void {
    this.ouvrierDetail = this.formBuilder.group({
      id: [''],
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      CIN: ['', Validators.required],
      telephone: ['', Validators.required],
      E_mail: ['', [Validators.required, Validators.email]],
      date_de_naissance: ['', Validators.required],
      photo: ['']
    });
  }

  checkOuvrierExists(): void {
    const { CIN } = this.ouvrierDetail.value;

    this.ouvrierService.checkIfOuvrierExists(CIN).subscribe({
      next: (exists) => {
        if (exists) {
          this.showCustomAlert('Cet ouvrier existe déjà.', 'danger');
        } else {
          this.addOuvrier();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de l\'existence de l\'ouvrier', err);
        this.showCustomAlert('Erreur lors de la vérification de l\'existence de l\'ouvrier', 'danger');
      }
    });
  }
  addOuvrier(): void {
    if (this.ouvrierDetail.valid) {
      const formData = new FormData();
      for (const key in this.ouvrierDetail.value) {
        if (this.ouvrierDetail.value.hasOwnProperty(key)) {
          formData.append(key, this.ouvrierDetail.value[key]);
        }
      }
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }
  
      this.ouvrierService.addOuvrier(formData).subscribe({
        next: (res) => {
          console.log('Ouvrier ajouté avec succès', res);
          this.showCustomAlert('Employé ajouté avec succès, priere d\'informer l\'ouvrier à consulter sa boite mail', 'success');
          this.getAllOuvriers();
          this.ouvrierDetail.reset();
          this.selectedFile = null;
  
          // Fermer le modal
          const modal = bootstrap.Modal.getInstance(this.addEmployeeModal.nativeElement);
          if (modal) {
            modal.hide();
          }
  
          setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = ''; 
          }, 500); 
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'ouvrier', err);
          this.showCustomAlert('Erreur lors de l\'ajout de l\'ouvrier', 'danger');
        }
      });
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

  getAllOuvriers(): void {
    this.ouvrierService.getAllOuvriers().subscribe({
      next: (res) => {
        this.ouvrierList = res;
        this.filteredOuvriers = res;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des ouvriers', err);
        this.showCustomAlert('Erreur lors de la récupération des ouvriers', 'danger');
      }
    });
  }

  filterOuvriers(): void {
    this.filteredOuvriers = this.ouvrierList.filter(ouvrier =>
      ouvrier.First_Name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  editOuvrier(ouvrier: Ouvrier): void {
    this.ouvrierDetail.patchValue({
      id: ouvrier.id,
      First_Name: ouvrier.First_Name,
      Last_Name: ouvrier.Last_Name,
      CIN: ouvrier.CIN,
      telephone: ouvrier.telephone,
      E_mail: ouvrier.E_mail,
      date_de_naissance: ouvrier.date_de_naissance,
      photo: ouvrier.photo || ''
    });
  }

  updateOuvrier(): void {
    if (this.ouvrierDetail.valid) {
      const id = this.ouvrierDetail.value.id;
      const formData = new FormData();
      for (const key in this.ouvrierDetail.value) {
        if (this.ouvrierDetail.value.hasOwnProperty(key)) {
          formData.append(key, this.ouvrierDetail.value[key]);
        }
      }
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }
  
      this.ouvrierService.updateOuvrier(id, formData).subscribe({
        next: (res) => {
          console.log('Ouvrier mis à jour avec succès', res);
          this.showCustomAlert('Ouvrier mis à jour avec succès', 'success');
          this.getAllOuvriers();
          this.ouvrierDetail.reset();
          this.selectedFile = null;
          
          const modal = bootstrap.Modal.getInstance(this.editEmployeeModal.nativeElement);
          if (modal) {
            modal.hide();
          }
  
          setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = ''; 
          }, 500); 
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l\'ouvrier', err);
          this.showCustomAlert('Erreur lors de la mise à jour de l\'ouvrier', 'danger');
        }
      });
    } else {
      console.error('Formulaire invalide');
      this.showCustomAlert('Formulaire invalide. Veuillez remplir tous les champs requis.', 'danger');
    }
  }
  

  deleteOuvrier(id: number | undefined): void {
    if (id !== undefined) {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrier?');
      if (confirmed) {
        this.ouvrierService.deleteOuvrier(id).subscribe({
          next: () => {
            console.log('Ouvrier supprimé avec succès');
            this.showCustomAlert('Ouvrier supprimé avec succès', 'success');
            this.getAllOuvriers();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'ouvrier', err);
            this.showCustomAlert('Erreur lors de la suppression de l\'ouvrier', 'danger');
          }
        });
      } else {
        console.log('Suppression annulée');
      }
    } else {
      console.error('ID de l\'ouvrier non défini');
      this.showCustomAlert('Erreur : ID de l\'ouvrier non défini', 'danger');
    }
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  getImageUrl(photoPath: string | null): string {
    if (photoPath) {
      return `http://localhost:3000/${photoPath}`;
    }
    return '';
  }

  closeModal(modalElement: ElementRef): void {
    const modalInstance = bootstrap.Modal.getInstance(modalElement.nativeElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    this.removeBackdrop();
  }

  removeBackdrop(): void {
    const backdropElement = document.querySelector('.modal-backdrop');
    if (backdropElement) {
      backdropElement.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  }
}