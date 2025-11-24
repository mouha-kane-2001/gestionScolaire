import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormDirective,
  RowComponent
} from '@coreui/angular';
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
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  seConnecter() {
    console.log('seConnecter() déclenchée');
    if (this.loginForm.invalid) {
      this.showAlert = true;
      this.alertType = 'danger';
      this.alertMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('Réponse reçue:', res);

        if (res && res.token && res.user) {
          // ✅ Sauvegarde avec le specific_id
          this.authService.saveToken(res.token);
          this.authService.saveUserInfo(res.user, res.specific_id); // ✅ Deux arguments maintenant

          this.showAlertMessage('Connexion réussie !', 'success');

          // Redirection selon le rôle
          const role = res.user.role?.trim().toUpperCase();
          console.log('📌 Rôle utilisateur:', role);
          console.log('📌 Specific ID:', res.specific_id);

          // Redirection selon le rôle
          switch (role) {
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
              // Vérification de l'ID parent
              const parentId = this.authService.getParentId();
              console.log('📌 Parent ID depuis AuthService:', parentId);
              console.log('📌 Parent ID depuis localStorage:', localStorage.getItem('parent_id'));
              this.router.navigate(['/parent/dashboard']);
              break;
            default:
              console.warn('Rôle non reconnu:', role);
              this.router.navigate(['/']);
          }
        } else {
          console.error('Réponse inattendue:', res);
          this.showAlertMessage('Erreur : format de réponse invalide.', 'danger');
        }
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        this.showAlertMessage(err.error?.message || 'Échec de la connexion', 'danger');
      }
    });
  }

  showAlertMessage(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  closeAlert() {
    this.showAlert = false;
  }
}
