<?php

namespace App\Http\Controllers;

use App\Models\Convocation;
use App\Jobs\EnvoyerNotificationJob;
use Illuminate\Http\Request;

class ConvocationController extends Controller
{
    /**
     * Liste toutes les convocations.
     */
    public function index()
    {
        return Convocation::with('parent','eleve.user')->get();
    }

 public function getByParent($parentId)
{
    $convocations = Convocation::with([
        'parent.user', // parent + son user
        'eleve.user' ,// élève + son user
          'eleve.classe'   // élève + son user

    ])
    ->where('parent_id', $parentId)
    ->orderBy('created_at', 'desc')
    ->get();

    return response()->json($convocations, 200);
}


    /**
     * Crée une nouvelle convocation et envoie une notification automatique.
     */
    public function store(Request $request)
    {
       $convocation = $validated = $request->validate([
            'parent_id' => 'required|exists:parents,id',
            'eleve_id' => 'nullable|exists:eleves,id',
            'objet' => 'required|string|max:255',
            'message' => 'required|string',
            'date_convocation' => 'required|date',
            'lieu' => 'nullable|string|max:255',
        ]);

        // ✅ 1. Création de la convocation
        $convocation = Convocation::create($validated);

        // ✅ 2. Déclenchement automatique de la notification
        $texteNotification = sprintf(
            "Nouvelle convocation : %s — %s (prévue le %s)",
            $validated['objet'],
            $validated['message'],
            date('d/m/Y', strtotime($validated['date_convocation']))
        );

        EnvoyerNotificationJob::dispatch([
            'user_id' => optional($convocation->parent->user)->id, // lien vers le compte user du parent
            'type'    => 'convocation',
            'element_lie_id' => $convocation->id,
            'type_element_lie' => 'convocation',
            'texte'   => $texteNotification,
        ]);

        return response()->json([
            'message' => 'Convocation créée et notification envoyée avec succès',
            'data' => $convocation
        ], 201);
    }

    /**
     * Affiche une convocation spécifique.
     */
    public function show(Convocation $convocation)
    {
        return $convocation->load('parent');
    }

    /**
     * Met à jour une convocation.
     */
    public function update(Request $request, Convocation $convocation)
    {
        $convocation->update($request->all());
        return response()->json($convocation);
    }

    /**
     * Supprime une convocation.
     */
    public function destroy(Convocation $convocation)
    {
        $convocation->delete();
        return response()->json(null, 204);
    }



    public function getByEleve(int $eleveId)
{
    $convocations = Convocation::with([
        'eleve.user',    // élève + son compte user
        'eleve.classe',  // classe de l'élève
        'parent.user'    // parent lié
    ])
    ->where('eleve_id', $eleveId)
    ->orderBy('created_at', 'desc')
    ->get();

    return response()->json($convocations, 200);
}

}
