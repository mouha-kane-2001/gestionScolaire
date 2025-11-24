export interface Utilisateur {
  id: number | null;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  motDePasseClaire?: string; // en clair côté front
  role: 'eleve' | 'parent' | 'prof' | 'admin';
  classe_id?: number | null;   // pour élève
   elevesIds: number[];        // pour parent
   matiere_id :number | null;    // pour professeur,
}
