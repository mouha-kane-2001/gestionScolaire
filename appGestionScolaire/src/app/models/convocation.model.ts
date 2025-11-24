
export interface Convocation {
  id?: number;
  eleve_id: number;
  objet: string;
  message: string;
  date_convocation: string;
  lieu?: string;
  etat?: 'non_lu' | 'lu';
  created_at?: string;
  updated_at?: string;
    eleve?: { user?: { prenom: string; nom: string }, classe?: { nom: string };}

}
