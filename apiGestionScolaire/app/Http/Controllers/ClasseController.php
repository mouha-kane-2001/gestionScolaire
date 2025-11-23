<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index()
    {
        return response()->json(Classe::all());
    }




public function getClassesDuProfesseur(int $profId)
{
    $classes = Classe::whereHas('professeurs', fn($query) =>
            $query->where('professeur_id', $profId)
        )
        ->withCount('eleves') // nombre d'élèves
        ->get()
        ->map(function($classe) {
            // total absences pour cette classe
            $totalAbsences = Absence::whereHas('eleve', fn($q) => $q->where('classe_id', $classe->id))->count();

            return [
                'id' => $classe->id,
                'nom' => $classe->nom,
                'nombreEleves' => $classe->eleves_count,
                'absences' => $totalAbsences,
            ];
        });

    // Totaux généraux
    $totalEleves = $classes->sum('nombreEleves');
    $totalAbsences = $classes->sum('absences');

    return response()->json([
        'classes' => $classes,
        'totalEleves' => $totalEleves,
        'totalAbsences' => $totalAbsences,
    ]);
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


}
