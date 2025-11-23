<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
protected $fillable = [
        'user_id',
        'matricule',
        'matiere_id'
    ];

   public function matiere()
    {
        return $this->belongsTo(Matiere::class, 'matiere_id', 'id');
    }
public function classes()
{
    return $this->belongsToMany(Classe::class, 'classe_professeur', 'professeur_id', 'classe_id');
}

    public function user()
    {
            return $this->belongsTo(User::class, 'user_id', 'id');

    }
protected static function booted()
    {
        static::creating(function ($professeur) {
            if (empty($professeur->matricule)) {
                $prenomPart = strtoupper(substr($professeur->user->prenom, 0, 2));
                $nomPart = strtoupper(substr($professeur->user->nom, 0, 2));
                $annee = date('Y');

                // Récupérer le dernier professeur
                $lastProf = Professeur::latest('id')->first();
                $count = $lastProf ? $lastProf->id + 1 : 1;
                $countPart = str_pad($count, 3, '0', STR_PAD_LEFT);

                $professeur->matricule = "$prenomPart-$nomPart-$annee-$countPart";
            }
        });
    }
}



