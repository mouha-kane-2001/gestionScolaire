<?php

namespace App\Http\Controllers;

use App\Models\ParentEleve;
use Illuminate\Http\Request;

class ParentController extends Controller
{public function enfants($parentId)
{
    $parent = ParentEleve::with('eleves','eleves.user','eleves.classe')->find($parentId);

    if (!$parent) {
        return response()->json(['message' => 'Parent non trouvé'], 404);
    }

    return response()->json($parent->eleves);
}

}
