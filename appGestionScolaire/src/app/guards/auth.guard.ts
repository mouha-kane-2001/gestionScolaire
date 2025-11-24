import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp && Math.floor(Date.now() / 1000) < payload.exp;
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService); // Injectez AuthService

  const token = localStorage.getItem('token');
  if (!token || !isTokenValid(token)) {
    router.navigate(['/login']);
    return false;
  }

  // Lisez le rôle depuis localStorage
  const userRole = localStorage.getItem('role')?.toUpperCase();
  console.log('Role from localStorage:', userRole); // Debug

  // Trouvez le rôle attendu dans la hiérarchie des routes
  let expectedRole: string | null = null;
  let currentRoute: ActivatedRouteSnapshot | null = route;
  while (currentRoute) {
    if (currentRoute.data['role']) {
      expectedRole = currentRoute.data['role']?.trim().toUpperCase();
      break;
    }
    currentRoute = currentRoute.parent;
  }

  // Si la route n'exige pas de rôle, autorisez l'accès
  if (!expectedRole) return true;

  // Vérifiez le rôle
  if (userRole !== expectedRole) {
    console.error(`Accès refusé : userRole=${userRole}, expectedRole=${expectedRole}`);
    alert('Vous n\'avez pas le droit d\'accéder à cette page !');

    // Redirection basée sur le rôle
    switch (userRole) {
      case 'ADMIN': alert('connexion reussi admin'); break;
      case 'PARENT': alert('connexion reussi parent'); break;
      case 'ELEVE':  alert('connexion reussi eleve'); break;
       case 'PROF': alert('connexion reussi professeur'); break;
      default: router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
