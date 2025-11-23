<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{

    protected $table = 'classes';

    protected $fillable = [
        'nom',
    ];

    public function eleves()
    {
        return $this->hasMany(Eleve::class, 'classe_id');
    }


    public function professeurs()
{
    return $this->belongsToMany(Professeur::class, 'classe_professeur', 'classe_id', 'professeur_id');
}


}
