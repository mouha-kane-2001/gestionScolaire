<?php

namespace App\Http\Controllers;

 use App\Http\Requests\NoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Jobs\EnvoyerNotificationJob;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\ParentEleve;
use Illuminate\Support\Facades\DB;
 use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index()
    {
        $notes = Note::with(['eleve.user', 'matiere.prof.user'])->get();
        return response()->json($notes);
    }

    public function store(NoteRequest $request)
    {
        // 1️⃣ Enregistrer la note
        $note = Note::create($request->validated());

        if (!$note->eleve_id) {
            return response()->json(['error' => "L'élève n'est pas défini."], 400);
        }

        // Vérifie que la relation est bien définie
        $eleve = $note->eleve;
        $parent = $eleve->parent ?? null;

        // 2️⃣ Notification pour l'élève
        EnvoyerNotificationJob::dispatch([
            'user_id' => $eleve->user_id,
            'type'    => 'note',
            'type_element_lie' => 'nouvelle note',
            'element_lie_id' => $note->id,
             'type_element_lie' => 'nouvelle note',
             'texte'   => "Une nouvelle note a été attribuée en matière #{$note->matiere_id}.",
            'note_id' => $note->id,
        ]);

        // 3️⃣ Notification pour le parent (si existe)
        if ($parent && $parent->user_id) {
            EnvoyerNotificationJob::dispatch([
                'user_id' => $parent->user_id,
                'type'    => 'note',
                'element_lie_id' => $note->id,
               'type_element_lie' => 'nouvelle note',
                'texte'   => "Votre enfant {$eleve->nom} a reçu une nouvelle note en matière #{$note->matiere_id}.",
                'note_id' => $note->id,
            ]);
        }

        return response()->json([
            'message' => 'Note attribuée, élève et parent notifiés !',
            'note'    => $note
        ]);
    }

    // Récupérer toutes les notes d'un élève
    public function notesEleve($eleveId)
    {
        $notes = Note::with(['matiere', 'matiere.prof'])
            ->where('eleve_id', $eleveId)
            ->get();

        return response()->json($notes);
    }

    // Récupérer toutes les notes des enfants d'un parent
// Récupérer toutes les notes des enfants d'un parent
 public function notesParent($parentId)
{
    $parent = ParentEleve::with(['eleves.user', 'eleves.classe'])->find($parentId);

    if (!$parent) {
        return response()->json(['error' => 'Parent non trouvé'], 404);
    }

    $data = [];

    foreach ($parent->eleves as $eleve) {
        $notes = Note::with(['matiere.prof.user'])
                    ->where('eleve_id', $eleve->id)
                    ->get();

        $notesFormatees = [];

        foreach ($notes as $note) {
            // Récupérer le premier prof s'il existe
            $prof = $note->matiere->prof->first() ?? null;
            $nomProf = $prof && $prof->user ? $prof->user->prenom : 'Professeur non assigné';

            $notesFormatees[] = [
                'id' => $note->id,
                'matiere' => $note->matiere->nom ?? 'Matière inconnue',
                'prof' => $nomProf,
                'type' => $note->type,
                'valeur' => $note->valeur,
                'date' => $note->date,
            ];
        }

        $data[] = [
            'eleve' => $eleve->user->prenom . ' ' . $eleve->user->nom,
            'classe' => $eleve->classe->nom ?? 'Non assigné',
            'notes' => $notesFormatees
        ];
    }

    return response()->json($data);
}


public function getNotesByProf($profId)
{
    $notes = Note::where('professeur_id', $profId)->get();
    return response()->json($notes);
}
































    /**
     * Attribuer des notes à tous les élèves d'une classe (Bulk)
     */
    /**
 * Attribuer des notes à tous les élèves d'une classe (Bulk)
 */

    public function storeBulk(NoteRequest $request)
{
    // NoteRequest a déjà validé les données
    $validated = $request->validated();

    DB::beginTransaction();

    try {
        $classeId = $validated['classe_id'];
        $matiereId = $validated['matiere_id'];
        $type = $validated['type'];
        $periode = $validated['periode'];
        $commentaire = $validated['commentaire'] ?? '';
        $numero = $validated['numero'] ?? null;
        $notesArray = $validated['notes']; // C'est un tableau d'objets

        $notesCreees = [];

        // Parcourir chaque note dans le tableau
        foreach ($notesArray as $noteItem) {
            $eleveId = $noteItem['eleve_id'];
            $valeur = $noteItem['valeur'];

            // Vérifier si l'élève appartient à la classe
            $eleve = Eleve::where('id', $eleveId)
                        ->where('classe_id', $classeId)
                        ->first();

            if (!$eleve) {
                continue; // Passer à l'élève suivant
            }

            // Si pas de numéro fourni et c'est un devoir, calculer automatiquement
            if (!$numero && $type === 'devoir') {
                $dernierNumero = Note::where('eleve_id', $eleveId)
                    ->where('matiere_id', $matiereId)
                    ->where('type', $type)
                    ->max('numero');
                $numeroActuel = $dernierNumero ? $dernierNumero + 1 : 1;
            } else {
                $numeroActuel = $numero;
            }

            // Créer la note
            $note = Note::create([
                'eleve_id' => $eleveId,
                'matiere_id' => $matiereId,
                'classe_id' => $classeId,
                'type' => $type,
                'valeur' => $valeur,
                'periode' => $periode,
                'commentaire' => $commentaire,
                'numero' => $type === 'devoir' ? $numeroActuel : null,
            ]);

            $notesCreees[] = $note;

            // Notifications...
            EnvoyerNotificationJob::dispatch([
                'user_id' => $eleve->user_id,
                'type' => 'note',
                'element_lie_id' => $note->id,
                'type_element_lie' => 'nouvelle note',
                'texte' => "Une nouvelle note (n°{$numeroActuel}) a été attribuée en matière #{$matiereId}.",
                'note_id' => $note->id,
            ]);

            if ($eleve->parent && $eleve->parent->user_id) {
                EnvoyerNotificationJob::dispatch([
                    'user_id' => $eleve->parent->user_id,
                    'type' => 'note',
                    'element_lie_id' => $note->id,
                    'type_element_lie' => 'nouvelle note',
                    'texte' => "Votre enfant {$eleve->nom} a reçu une nouvelle note (n°{$numeroActuel}) en matière #{$matiereId}.",
                    'note_id' => $note->id,
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'Notes attribuées avec succès.',
            'notes_attribuees' => count($notesCreees),
            'data' => $notesCreees
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Erreur lors de l\'attribution des notes',
            'details' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Récupérer les élèves d'une classe avec leurs notes existantes
     */
    public function getElevesAvecNotes($classeId, $matiereId, $type = null, $periode = null)
    {
        $eleves = Eleve::with(['user', 'classe'])
            ->where('classe_id', $classeId)
            ->get()
            ->map(function ($eleve) use ($matiereId, $type, $periode) {
                // Récupérer la note existante si elle existe
                $noteExistante = Note::where('eleve_id', $eleve->id)
                    ->where('matiere_id', $matiereId)
                    ->when($type, function ($query) use ($type) {
                        return $query->where('type', $type);
                    })
                    ->when($periode, function ($query) use ($periode) {
                        return $query->where('periode', $periode);
                    })
                    ->first();

                return [
                    'id' => $eleve->id,
                    'nom_complet' => $eleve->user->prenom . ' ' . $eleve->user->nom,
                    'matricule' => $eleve->matricule,
                    'note_existante' => $noteExistante ? [
                        'id' => $noteExistante->id,
                        'valeur' => $noteExistante->valeur,
                        'type' => $noteExistante->type,
                        'periode' => $noteExistante->periode,
                        'commentaire' => $noteExistante->commentaire
                    ] : null
                ];
            });

        return response()->json($eleves);
    }






/**
 * Mettre à jour une note
 */
public function updateBulk(UpdateNoteRequest $request){
    $validated = $request->validated();

    DB::beginTransaction();

    try {
        $notesModifiees = [];
        $notifications = [];

        foreach ($validated['notes'] as $noteData) {
            $note = Note::find($noteData['note_id']);

            if (!$note) {
                continue;
            }

            // Sauvegarder l'ancienne valeur pour le log
            $ancienneValeur = $note->valeur;
            $nouvelleValeur = $noteData['valeur'];

            // Ne mettre à jour que si la valeur a changé
            if ($ancienneValeur != $nouvelleValeur || isset($noteData['commentaire'])) {
                $note->update([
                    'valeur' => $nouvelleValeur,
                    'commentaire' => $noteData['commentaire'] ?? $note->commentaire
                ]);

                $notesModifiees[] = $note;

                // Préparer les notifications
                $notifications[] = [
                    'user_id' => $note->eleve->user_id,
                    'type' => 'note_modifiee',
                    'element_lie_id' => $note->id,
                    'type_element_lie' => 'note modifiée',
                    'texte' => "Votre note en matière #{$note->matiere_id} a été modifiée (ancienne: {$ancienneValeur}/20, nouvelle: {$nouvelleValeur}/20).",
                    'note_id' => $note->id,
                ];

                // Notification pour le parent
                if ($note->eleve->parent && $note->eleve->parent->user_id) {
                    $notifications[] = [
                        'user_id' => $note->eleve->parent->user_id,
                        'type' => 'note_modifiee',
                        'element_lie_id' => $note->id,
                        'type_element_lie' => 'note modifiée',
                        'texte' => "La note de votre enfant {$note->eleve->nom} en matière #{$note->matiere_id} a été modifiée (ancienne: {$ancienneValeur}/20, nouvelle: {$nouvelleValeur}/20).",
                        'note_id' => $note->id,
                    ];
                }
            }
        }

        // Envoyer toutes les notifications
        foreach ($notifications as $notification) {
            EnvoyerNotificationJob::dispatch($notification);
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'Notes modifiées avec succès',
            'notes_modifiees' => count($notesModifiees),
            'data' => $notesModifiees
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Erreur lors de la modification des notes',
            'details' => $e->getMessage()
        ], 500);
    }
}

/**
 * Supprimer une note
 */
public function destroy($id)
{
    $note = Note::findOrFail($id);
    $note->delete();

    return response()->json([
        'message' => 'Note supprimée avec succès'
    ]);
}




/**
 * Récupérer les notes par filtre (classe, matière, type, période, numéro)
 */
public function getNotesByFiltre(Request $request)
{
    $query = Note::with(['eleve.user', 'matiere', 'classe'])
                ->whereHas('eleve', function ($q) use ($request) {
                    if ($request->has('classe_id')) {
                        $q->where('classe_id', $request->classe_id);
                    }
                })
                ->whereHas('matiere', function ($q) use ($request) {
                    if ($request->has('matiere_id')) {
                        $q->where('id', $request->matiere_id);
                    }
                });

    // Filtrer par type (devoir ou examen)
    if ($request->has('type') && $request->type) {
        $query->where('type', $request->type);
    }

    // Filtrer par période (trimestre1 ou trimestre2)
    if ($request->has('periode') && $request->periode) {
        $query->where('periode', $request->periode);
    }

    // Filtrer par numéro (pour les devoirs)
    if ($request->has('numero') && $request->numero) {
        $query->where('numero', $request->numero);
    }

    // Trier par élève
    $query->orderBy('eleve_id');

    $notes = $query->get();

    return response()->json($notes);
}

/**
 * Récupérer les numéros de devoirs disponibles pour une classe/matière
 */
public function getNumerosDevoirsDisponibles(Request $request)
{
    $request->validate([
        'classe_id' => 'required|exists:classes,id',
        'matiere_id' => 'required|exists:matieres,id',
        'periode' => 'required|in:trimestre1,trimestre2'
    ]);

    $classeId = $request->classe_id;
    $matiereId = $request->matiere_id;
    $periode = $request->periode;

    // Récupérer tous les numéros de devoirs existants pour cette classe/matière/période
    $numerosExistants = Note::where('classe_id', $classeId)
        ->where('matiere_id', $matiereId)
        ->where('type', 'devoir')
        ->where('periode', $periode)
        ->distinct()
        ->pluck('numero')
        ->toArray();

    // Générer la liste complète des numéros (1-10)
    $tousNumeros = range(1, 10);

    $resultat = array_map(function($numero) use ($numerosExistants) {
        return [
            'numero' => $numero,
            'estDisponible' => !in_array($numero, $numerosExistants),
            'existeDeja' => in_array($numero, $numerosExistants)
        ];
    }, $tousNumeros);

    return response()->json($resultat);
}

}
