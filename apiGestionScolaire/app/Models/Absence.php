<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
   protected $fillable = [
        'eleve_id',
        'date_absence',
        'matiere_id',
        'motif',
        'professeur_id',
        'justifiee',
    ];

    // Relation avec élève
    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    // Relation vers le professeur
    public function professeur()
    {
        return $this->belongsTo(Professeur::class, 'professeur_id', 'id');
    }
    // Relation avec matière
    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }
}
