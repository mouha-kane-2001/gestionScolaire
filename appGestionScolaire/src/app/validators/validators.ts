import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateEmbaucheValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const date = new Date(value);
  const today = new Date();

  if (date > today) {
    return { futureDate: true }; // date dans le futur
  }

  return null; // date valide
}


export function dateLimiteValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignorer l'heure pour comparer juste la date

  if (date < today) {
    return { pastDate: true }; // date dans le passé
  }

  return null; // date valide
}
