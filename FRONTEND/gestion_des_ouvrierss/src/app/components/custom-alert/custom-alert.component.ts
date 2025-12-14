import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-alert',
  template: `
    <div *ngIf="show" class="alert" [ngClass]="alertClass" role="alert">
      {{ message }}
      <button type="button" class="btn-close" (click)="onClose.emit()" aria-label="Close"></button>
    </div>
  `,
  styles: [`
    .alert {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      padding: 15px;
      border-radius: 4px;
      opacity: 0.9;
      transition: opacity 0.3s;
    }
    .alert:hover {
      opacity: 1;
    }
    .alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .alert-danger {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
  `]
})
export class CustomAlertComponent {
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() type: 'success' | 'danger' = 'success';
  @Output() onClose = new EventEmitter<void>();

  get alertClass(): string {
    return `alert-${this.type}`;
  }
}