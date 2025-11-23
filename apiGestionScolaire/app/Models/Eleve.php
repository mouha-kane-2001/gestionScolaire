<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eleve extends Model
{
    protected $table = 'eleves';

    protected $fillable = [

        'classe_id',
        'matricule',
        'user_id',
        'parent_id'

    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class, 'classe_id', 'id');
    }

    public function absences()
{
    return $this->hasMany(\App\Models\Absence::class, 'eleve_id');
}

    public function notes()
    {
        return $this->hasMany(Note::class, 'eleve_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(ParentEleve::class, 'parent_id', 'id');
    }

    public function user()
{
    return $this->belongsTo(User::class);
}
protected static function booted()
{
    static::creating(function ($eleve) {
        if (empty($eleve->matricule)) {
            $prenomPart = strtoupper(substr($eleve->user->prenom, 0, 2));
            $nomPart = strtoupper(substr($eleve->user->nom, 0, 2));
            $annee = date('Y'); // ou récupérer l'année d'inscription depuis une colonne si elle existe

            // Compteur simple basé sur l'ID futur (attention, nécessite un truc sûr si concurrent)
            $lastEleve = \App\Models\Eleve::latest('id')->first();
            $count = $lastEleve ? $lastEleve->id + 1 : 1;
            $countPart = str_pad($count, 3, '0', STR_PAD_LEFT);

            $eleve->matricule = "$prenomPart-$nomPart-$annee-$countPart";
        }
    });
}

}
