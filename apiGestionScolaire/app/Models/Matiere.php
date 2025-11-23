<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $fillable = ['nom'];

    public function notes()
    {
        return $this->hasMany(Note::class, 'matiere_id', 'id');
    }

    public function prof()
{
    return $this->hasMany(Professeur::class); // une matière peut avoir plusieurs profs
}

}

