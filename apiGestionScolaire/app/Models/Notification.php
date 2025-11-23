<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
   protected $fillable = [
        'user_id',
        'element_lie_id',
        'type_element_lie',
        'type',
        'texte',
        'statut',
    ];

    public function users()
    {
        return $this->belongsTo(User::class);
    }

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
    public function note()
    {
        return $this->belongsTo(Note::class);
    }
public function elementLie()
{
    // Assurez-vous que le type est toujours en minuscules et sans faute
    $type = strtolower(trim($this->type_element_lie));

    switch($type) {
        case 'message':
            return $this->belongsTo(Message::class, 'element_lie_id');
        case 'note':
            return $this->belongsTo(Note::class, 'element_lie_id');
        case 'absence': // Correction de l'orthographe
            return $this->belongsTo(Absence::class, 'element_lie_id');
        case 'convocation':
            return $this->belongsTo(Convocation::class, 'element_lie_id');
        default:
            // Pour les types inconnus ou null, retourner une relation "vide"
            return $this->belongsTo(Message::class, 'element_lie_id')
                       ->whereNull('id'); // Jamais de résultats
    }
}

}
