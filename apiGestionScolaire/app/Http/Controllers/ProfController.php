<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use Illuminate\Http\Request;

class ProfController extends Controller
{
    public function index()
    {
        $professeurs = Professeur::with('user', 'matiere')->get(); // pour avoir nom/prenom via relation user
        return response()->json($professeurs);
    }

    // Affecter un professeur à des classes
    public function affecterClasse(Request $request)
{
    $request->validate([
        'professeurId' => 'required|exists:professeurs,id',
        'classesIds'   => 'required|array',
        'classesIds.*' => 'exists:classes,id'
    ]);

    $professeur = Professeur::findOrFail($request->professeurId);
    $professeur->classes()->syncWithoutDetaching($request->classesIds);
    //$professeur->classes()->sync($request->classesIds);

    return response()->json([
        'message' => 'Professeur affecté aux classes avec succès !'
    ]);
}

}
