import { Classe } from "./classe.model";

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;

  user ?: {
    id: number;
    nom: string;
    prenom: string;
  };
  classe: Classe;
  classe_id: number;
     parent_id?: number;
     parent?: {
       id: number;
       user_id: number;

     };

}
