<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    // Colonnes autorisées pour le mass-assignment
    protected $fillable = [
        'user_id',
        'matricule',
    ];

    // Relation vers User (optionnel mais recommandé)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
