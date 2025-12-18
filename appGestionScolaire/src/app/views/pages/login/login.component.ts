import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  showAlert = false;
  alertType: 'success' | 'danger' = 'success';
  alertMessage = '';
  isLoading = false; // Pour gérer l'état de chargement

  isInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  seConnecter() {
    // Réinitialiser l'alerte
    this.showAlert = false;
console.log('🔴 VPS DEBUG - Avant login');
  console.log('localStorage disponible?', typeof localStorage !== 'undefined');
  
    if (this.loginForm.invalid) {
      this.showAlertMessage('Veuillez remplir tous les champs correctement.', 'danger');

      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    this.isLoading = true;

    const credentials = this.loginForm.value;
    console.log('Tentative de connexion:', { email: credentials.email });

    this.authService.login(credentials).subscribe({
      next: (res) => {
console.log('🔴 VPS DEBUG - Réponse reçue:', res);
        this.isLoading = false;
        console.log('Réponse reçue:', res);

        if (res && res.token && res.user) {
          // Sauvegarde des données
          this.authService.saveToken(res.token);
          this.authService.saveUserInfo(res.user, res.specific_id);

          this.showAlertMessage('Connexion réussie !', 'success');

          // Redirection avec un petit délai pour voir le message
          setTimeout(() => {
            this.redirectUser(res.user.role, res.specific_id);
          }, 1500);
        } else {
          console.error('Réponse inattendue:', res);
          this.showAlertMessage('Erreur : format de réponse invalide.', 'danger');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de connexion complète:', error);

        // Afficher le message d'erreur spécifique
        const message = error.message || 'Échec de la connexion';
        this.showAlertMessage(message, 'danger');
      }
    });
  }

  private redirectUser(role: string, specificId?: string) {
    const roleNormalized = role?.trim().toUpperCase();
    console.log('Redirection pour rôle:', roleNormalized);

    switch (roleNormalized) {
      case 'ADMIN':
        this.router.navigate(['/dashboard']);
        break;
      case 'ELEVE':
        this.router.navigate(['/eleve/dashboard']);
        break;
      case 'PROF':
        this.router.navigate(['/prof/dashboard']);
        break;
      case 'PARENT':
        console.log('Parent ID:', specificId);
        localStorage.setItem('parent_id', specificId || '');
        this.router.navigate(['/parent/dashboard']);
        break;
      default:
        console.warn('Rôle non reconnu:', roleNormalized);
        this.showAlertMessage('Rôle utilisateur non reconnu', 'danger');
    }
  }

  showAlertMessage(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Masquer automatiquement l'alerte après 5 secondes
    if (type === 'danger') {
      setTimeout(() => {
        this.closeAlert();
      }, 5000);
    }
  }

  closeAlert() {
    this.showAlert = false;
  }
}
