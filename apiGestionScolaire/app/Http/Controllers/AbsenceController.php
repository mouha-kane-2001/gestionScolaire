<?php

namespace App\Http\Controllers;

use App\Http\Requests\AbsenceRequest;
 use App\Models\Absence;
use App\Models\Classe;
use App\Models\Eleve;
 use App\Models\Professeur;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;


class AbsenceController extends Controller
{

    public function index()
    {
        $absences = Absence::with(['eleve.user', 'matiere', 'professeur.user'])
            ->orderBy('date_absence', 'desc')
            ->get();

        return response()->json($absences);
    }



public function store(AbsenceRequest $request)
{
    try {
        // 🔹 Vérifier que l'utilisateur est bien authentifié
        if (!Auth::check()) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Non authentifié.'], 401);
        }

        $user = Auth::user();
        Log::info('User connecté', ['user_id' => $user->id, 'email' => $user->email]);

        if (!$user) {
            Log::error('Utilisateur non trouvé après Auth::check()');
            return response()->json(['error' => 'Utilisateur non trouvé.'], 401);
        }

        // 🔹 Récupérer le professeur correspondant
        $prof = Professeur::where('user_id', $user->id)->with('matiere')->first();

        if (!$prof) {
            Log::error('Professeur non trouvé pour cet utilisateur', ['user_id' => $user->id]);
            return response()->json(['error' => 'Professeur non trouvé pour cet utilisateur.'], 403);
        }

        Log::info('Professeur récupéré', ['prof_id' => $prof->id, 'matiere_id' => $prof->matiere_id]);

        if (!$prof->matiere_id) {
            Log::error('Aucune matière associée à ce professeur', ['prof_id' => $prof->id]);
            return response()->json(['error' => 'Aucune matière associée à ce professeur.'], 400);
        }

        $validated = $request->validated();
        $validated['matiere_id'] = $prof->matiere_id;
        $validated['professeur_id'] = $prof->id;

        Log::info('Données validées avant création absence', ['validated' => $validated]);

        // 🔹 Vérifier si l'absence existe déjà
        $absenceExistante = Absence::where('eleve_id', $request->eleve_id)
            ->where('date_absence', $request->date_absence)
            ->where('matiere_id', $prof->matiere_id)
            ->first();

        // 🔹 Si l'absence existe déjà, on la met à jour
        if ($absenceExistante) {
            Log::warning('Absence déjà existante, mise à jour', ['absence_id' => $absenceExistante->id]);

            $absenceExistante->update([
                'motif' => $validated['motif'],
                'justifiee' => $validated['justifiee'],
                'commentaire' => $validated['commentaire'] ?? null,
                'professeur_id' => $prof->id
            ]);

            return response()->json([
                'message' => 'Absence mise à jour avec succès.',
                'absence' => $absenceExistante,
                'existant' => true
            ], 200);
        }

        // 🔹 Créer une nouvelle absence seulement si elle n'existe pas
        $absence = Absence::create($validated);
        Log::info('Nouvelle absence créée', ['absence_id' => $absence->id]);

        return response()->json([
            'message' => 'Absence enregistrée avec succès.',
            'absence' => $absence,
            'existant' => false
        ], 201);

    } catch (\Exception $e) {
        Log::egdsrror('Erreur lors de l\'enregistrement de l\'absence', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Erreur serveur lors de l\'enregistrement.'
        ], 500);
    }
}



public function getAbsencesDuJour(Request $request)
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié.'], 401);
        }

        $prof = Professeur::where('user_id', $user->id)->first();
        if (!$prof) {
            return response()->json(['error' => 'Professeur non trouvé.'], 403);
        }

        // Récupérer les paramètres
        $date = $request->input('date', now()->format('Y-m-d'));
        $matiereId = $request->input('matiere_id', $prof->matiere_id);

        if (!$matiereId) {
            return response()->json(['error' => 'Matière non spécifiée.'], 400);
        }

        $absences = Absence::with('eleve')
            ->where('date_absence', $date)
            ->where('matiere_id', $matiereId)
            ->where('professeur_id', $prof->id)
            ->get();

        return response()->json($absences);

    } catch (\Exception $e) {
        Log::error('Erreur getAbsencesDuJour', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Erreur serveur.'], 500);
    }
}


public function supprimerAbsence(Request $request)
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié.'], 401);
        }

        $prof = Professeur::where('user_id', $user->id)->first();
        if (!$prof) {
            return response()->json(['error' => 'Professeur non trouvé.'], 403);
        }

        // Paramètres obligatoires
        $eleveId = $request->input('eleve_id');
        $dateAbsence = $request->input('date_absence');
        $matiereId = $request->input('matiere_id');

        if (!$eleveId || !$dateAbsence || !$matiereId) {
            return response()->json([
                'error' => 'Paramètres manquants. Requis: eleve_id, date_absence, matiere_id'
            ], 400);
        }

        $absence = Absence::where('eleve_id', $eleveId)
            ->where('date_absence', $dateAbsence)
            ->where('matiere_id', $matiereId)
            ->where('professeur_id', $prof->id)
            ->first();

        if (!$absence) {
            return response()->json(['error' => 'Absence non trouvée.'], 404);
        }

        $absence->delete();
        return response()->json(['message' => 'Absence supprimée avec succès.']);

    } catch (\Exception $e) {
        Log::error('Erreur supprimerAbsence', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Erreur serveur.'], 500);
    }
}

    public function absencesEleve($eleveId)
{
    // Charger l'élève avec ses absences
    $eleve = Eleve::with([
        'absences' => function($query) {
            $query->orderBy('date_absence', 'desc');
        },
        'absences.matiere',
        'absences.professeur.user'
    ])->find($eleveId);

    if (!$eleve) {
        return response()->json(['error' => "Élève non trouvé."], 404);
    }

    return response()->json($eleve->absences);
}


    private function getMotifLabel($motif)
    {
        $labels = [
            'absent'            => 'absent',
            'retard'            => 'en retard',
            'mauvaise_conduite' => 'ayant eu une mauvaise conduite',
            'non_participation' => 'ne participant pas',
            'non_travail'       => 'ne faisant pas les exercices',
            'cours_manque'      => 'ayant manqué un autre cours',
            'sans_billet'       => 'sans billet d\'entrée',
            'autre'             => 'absent pour autre raison'
        ];

        return $labels[$motif] ?? $motif;
    }

    public function absencesParParent($parentId)
{

    $eleves = Eleve::with(['user', 'absences' => function($q) {
        $q->orderBy('date_absence', 'desc');
    }])
    ->where('parent_id', $parentId)
    ->get();

    return response()->json($eleves);
}



// AbsenceController.php
public function tauxParClasse()
{
    $classes = Classe::with('eleves.absences')->get();

    $result = $classes->map(function($classe) {
        $total = $classe->eleves->count() * 30; // si 30 jours
        $absences = $classe->eleves->sum(fn($e) => $e->absences->count());
        $taux = $total ? round(($absences / $total) * 100, 2) : 0;
        return [
            'nom' => $classe->nom,
            'taux' => $taux
        ];
    });

    return response()->json($result);
}


}
