<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bulletin extends Model
{
 protected $fillable = [
        'eleve_id',
        'periode',
    ];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }
}
