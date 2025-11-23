<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class ParentEleve extends Model
{
   protected $table = 'parents';

    protected $fillable = [
        'user_id',
        'telephone',
    ];



    // 🔹 Un parent correspond à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function eleves()
    {
        return $this->hasMany(Eleve::class, 'parent_id');
    }
}
