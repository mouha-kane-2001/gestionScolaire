<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Convocation extends Model
{
    protected $fillable = [
        'parent_id',
        'objet',
        'message',
        'date_convocation',
        'eleve_id',
        'etat',
    ];

    public function parent()
    {
        return $this->belongsTo(ParentEleve::class);
    }

    public function eleve()
{
    return $this->belongsTo(Eleve::class);
}
}
