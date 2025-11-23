<?php

namespace App\Http\Controllers;

use App\Models\Eleve;
use Illuminate\Http\Request;

class EleveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function getElevesAvecMatricule()
{
    $eleves = Eleve::with('user','classe','parent') // récupère les infos liées au User
        ->get()
        ->map(function ($eleve) {
            return [
                 'id' => $eleve->id,        // ← id de l’élève, pas du user
                'user_id' => $eleve->user->id,
                 'prenom' => $eleve->user->prenom,
                'nom' => $eleve->user->nom,
                'email' => $eleve->user->email,
                'role' => $eleve->user->role,
                'matricule' => $eleve->matricule,
                'classe_id' => $eleve->classe_id,
                'classe' => $eleve->classe ?? null,
                'parent_id' => $eleve->parent_id,
                'parent' => $eleve->parent ?? null,
            ];
        });

    return response()->json($eleves);
}


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    public function search(Request $request)
{
    $q = $request->query('q');

    return Eleve::with('users')
        ->where('matricule', 'like', "%$q%")
        ->orWhereHas('users', function($query) use ($q) {
            $query->where('nom', 'like', "%$q%")
                  ->orWhere('prenom', 'like', "%$q%");
        })
        ->limit(10)
        ->get()
        ->map(function ($eleve) {
            return [
                'id' => $eleve->id,
                'matricule' => $eleve->matricule,
                'prenom' => $eleve->user->prenom,
                'nom' => $eleve->user->nom
            ];
        });
}

}
