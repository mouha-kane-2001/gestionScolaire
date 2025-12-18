// alert.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert/alert.service';


@Component({
  selector: 'app-alert-global',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-container position-fixed top-0 start-50 translate-middle-x mt-3 z-3">
      <div *ngFor="let alert of alerts"
           class="alert alert-dismissible fade show shadow mb-2"
           [ngClass]="{
             'alert-success': alert.type === 'success',
             'alert-danger': alert.type === 'error',
             'alert-info': alert.type === 'info',
             'alert-warning': alert.type === 'warning'
           }"
           role="alert">
        <div class="d-flex align-items-center">
          <i class="bi me-2"
             [class.bi-check-circle-fill]="alert.type === 'success'"
             [class.bi-exclamation-circle-fill]="alert.type === 'error'"
             [class.bi-info-circle-fill]="alert.type === 'info'"
             [class.bi-exclamation-triangle-fill]="alert.type === 'warning'"></i>
          <span [innerHTML]="alert.message"></span>
        </div>
        <button type="button" class="btn-close" (click)="removeAlert(alert.id)" aria-label="Close"></button>
      </div>
    </div>
  `,
  styles: [`
    .alert-container {
      min-width: 300px;
      max-width: 500px;
      z-index: 9999;
    }

    .alert {
      animation: slideDown 0.3s ease-out;
      border-radius: 8px;

      &.fade {
        animation: slideUp 0.3s ease-out;
      }
    }

    @keyframes slideDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-20px);
        opacity: 0;
      }
    }
  `]
})
export class AlertGlobalComponent implements OnInit {
  alerts: any[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    // S'abonner aux changements d'alertes
    this.alerts = this.alertService.getAlerts();

    // Surveiller les changements (solution simple)
    setInterval(() => {
      this.alerts = [...this.alertService.getAlerts()];
    }, 100);
  }

  removeAlert(id: number) {
    this.alertService.removeAlert(id);
  }
}
