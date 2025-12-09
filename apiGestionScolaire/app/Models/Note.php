<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{

    // Colonnes que l'on peut remplir via create() ou update()
    protected $fillable = [
        'eleve_id',
        'matiere_id',
        'type',
        'valeur',
        'periode',
        'numero',
        'classe_id'
    ];

    // Relation avec Eleve
    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    // Relation avec Matiere
    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }
    //Relation avec classe

    public function classe()
{
    return $this->belongsTo(Classe::class);
}
}
