// alert.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts: any[] = [];
  private alertIdCounter = 0;

  // Types d'alerte supportés
  readonly ALERT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
  } as const;

  /**
   * Récupère toutes les alertes
   */
  getAlerts() {
    return this.alerts;
  }

  /**
   * Ajoute une alerte
   */
  addAlert(type: 'success' | 'error' | 'info' | 'warning', message: string, autoClose: boolean = true, duration: number = 5000) {
    const id = ++this.alertIdCounter;
    const newAlert = {
      id,
      type,
      message,
      autoClose,
      duration
    };

    this.alerts.push(newAlert);

    // Auto-fermeture si activée
    if (autoClose) {
      setTimeout(() => {
        this.removeAlert(id);
      }, duration);
    }

    return id;
  }

  /**
   * Ajoute une alerte de succès
   */
  success(message: string, autoClose: boolean = true, duration: number = 3000) {
    return this.addAlert(this.ALERT_TYPES.SUCCESS, message, autoClose, duration);
  }

  /**
   * Ajoute une alerte d'erreur
   */
  error(message: string, autoClose: boolean = true, duration: number = 5000) {
    return this.addAlert(this.ALERT_TYPES.ERROR, message, autoClose, duration);
  }

  /**
   * Ajoute une alerte d'information
   */
  info(message: string, autoClose: boolean = true, duration: number = 4000) {
    return this.addAlert(this.ALERT_TYPES.INFO, message, autoClose, duration);
  }

  /**
   * Ajoute une alerte d'avertissement
   */
  warning(message: string, autoClose: boolean = true, duration: number = 4000) {
    return this.addAlert(this.ALERT_TYPES.WARNING, message, autoClose, duration);
  }

  /**
   * Supprime une alerte par son ID
   */
  removeAlert(id: number) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

  /**
   * Efface toutes les alertes
   */
  clear() {
    this.alerts = [];
  }

  /**
   * Remplace les alertes JavaScript classiques
   */
  alert(message: string, title: string = 'Information') {
    return this.info(`${title}: ${message}`);
  }

  /**
   * Pour confirmer une action (remplace confirm())
   */
  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Vous pouvez implémenter une modal de confirmation ici
      // Pour l'instant, on utilise le confirm natif
      const result = window.confirm(message);
      resolve(result);
    });
  }
}
