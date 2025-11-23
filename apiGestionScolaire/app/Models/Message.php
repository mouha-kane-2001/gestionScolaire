<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
   protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'role_expediteur',
        'role_destinataire',
        'classe_id',
        'groupe_id',
        'audience',
        'objet',
        'type',
        'contenu',
        'priorite',
        'categorie',
        'statut',
    ];

    // Relations
    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class, 'classe_id');
    }
}
