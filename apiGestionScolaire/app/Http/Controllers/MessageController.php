<?php

namespace App\Http\Controllers;

use App\Jobs\EnvoyerMessageJob;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{


    public function envoyerMessage(Request $request)
    {
        $data = $request->validate([
            'expediteur_id' => 'required|integer',
            'destinataire_id' => 'nullable|integer',
            'role_expediteur' => 'required|string|in:prof,admin,parent',
            'role_destinataire' => 'required|string|in:admin,parent,eleve,prof',
            'objet' => 'required|string|min:3',
            'contenu' => 'required|string|min:10',
            'type' => 'required|string|in:message,annonce,urgence,demande,technique',
            'priorite' => 'required|string|in:normal,haute,urgent',
            'categorie' => 'nullable|string',
            'classe_id' => 'nullable|integer'
        ]);

        try {
              $data['groupe_id'] = uniqid('msg_');
            // Utilisez le Job pour l'envoi
            EnvoyerMessageJob::dispatch($data);

            return response()->json(['message' => 'Message envoyé avec succès'], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi',
                'error' => $e->getMessage()
            ], 422);
        }
    }

     /**
     * 📤 Récupérer les messages envoyés par un utilisateur
     */
    public function getSentMessages($id)
{
    $messages = Message::where('expediteur_id', $id)
        ->selectRaw('MIN(id) as id, groupe_id, objet, contenu, type, priorite, categorie, classe_id, role_destinataire, created_at')
        ->groupBy('groupe_id', 'objet', 'contenu', 'type', 'priorite', 'categorie', 'classe_id', 'role_destinataire', 'created_at')
        ->orderByDesc('created_at')
        ->get();

    return response()->json($messages);
}


    public function getReceivedMessages($id)
{
    $messages = Message::where('destinataire_id', $id)
        ->orderByDesc('created_at')
        ->get();

    return response()->json($messages);
}

    /**
     * ✅ Liste de tous les messages
     */
    public function allMessages()
    {
        return response()->json(Message::orderByDesc('created_at')->get());
    }

    /**
     * ❌ Supprimer un message
     */
    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message supprimé']);
    }

    public function index()
    {
        $messages = Message::orderByDesc('created_at')->get();
        return response()->json($messages);
    }

}
