<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoteRequest;
use App\Jobs\EnvoyerNotificationJob;
use App\Models\Note;
use App\Models\ParentEleve;

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




}
