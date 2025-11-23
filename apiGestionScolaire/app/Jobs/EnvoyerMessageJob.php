<?php

namespace App\Jobs;

use App\Models\Eleve;
use App\Models\Message;
use App\Models\ParentEleve;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Jobs\EnvoyerNotificationJob;
use App\Models\Admin;

class EnvoyerMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
        Log::info('EnvoyerMessageJob __construct', $data);
    }

    public function handle()
    {
        $messagesIds = [];
        Log::info('EnvoyerMessageJob handle start', $this->data);

        // 1️⃣ Message individuel
        if (!empty($this->data['destinataire_id'])) {
            Log::info('Message individuel pour destinataire_id', ['destinataire_id' => $this->data['destinataire_id']]);
            $message = $this->createMessage($this->data['destinataire_id']);
            $messagesIds[] = $message->id;
            Log::info('Message créé', ['element_lie_id' => $message->id]);

            $this->sendNotifications($message);
        }
        // 2️⃣ Message à une classe
        elseif (!empty($this->data['classe_id'])) {
            Log::info('Message pour classe_id', ['classe_id' => $this->data['classe_id']]);
            $eleves = Eleve::with(['user', 'parent.user'])
                ->where('classe_id', $this->data['classe_id'])
                ->get();
            Log::info('Eleves récupérés', ['count' => $eleves->count()]);

            foreach ($eleves as $eleve) {
                $message = $this->createMessage($eleve->user->id);
                $messagesIds[] = $message->id;
                Log::info('Message créé pour élève', ['eleve_id' => $eleve->id, 'element_lie_id' => $message->id]);

                $this->sendNotifications($message, $eleve);
            }
        }
        // 3️⃣ Message groupé par rôle
        else {
            Log::info('Message groupé par rôle', ['role_destinataire' => $this->data['role_destinataire']]);

            $recipients = match($this->data['role_destinataire']) {
                'eleve' => Eleve::all(),
                'parent' => ParentEleve::all(),
                'prof' => Professeur::all(),
                'admin' => Admin::with('user')->whereHas('user')->get(),
                default => collect(),
            };
            Log::info('Destinataires récupérés', ['count' => $recipients->count()]);

foreach ($recipients as $recipient) {
    if ($this->data['role_destinataire'] === 'admin') {
        if (!isset($recipient->user) || !$recipient->user) {
            Log::warning('Admin sans user lié, on skip', ['admin_id' => $recipient->id]);
            continue; // on ignore cet admin
        }
        $destinataireId = $recipient->user->id;
    } else {
        $destinataireId = $recipient->user->id ?? $recipient->id;
    }

    $message = $this->createMessage($destinataireId);
    $messagesIds[] = $message->id;

    $this->sendNotifications($message, $recipient);
}


        }

        Log::info('Notification expéditeur', ['messagesIds' => $messagesIds]);
        EnvoyerNotificationJob::dispatch([
        'user_id' => $this->data['expediteur_id'],
        'type_element_lie' => 'message',
        'type' => 'message_envoye',
        'texte' => 'Votre message "' . ($this->data['objet'] ?? 'sans objet') . '" a été envoyé avec succès',
        'element_lie_id' => $messagesIds[0] ? (int) $messagesIds[0] : null, //
        'lu' => false,
        ]);
    }

    private function createMessage($destinataireId): Message
    {
        $message = Message::create([
            'expediteur_id' => $this->data['expediteur_id'],
            'destinataire_id' => $destinataireId,
            'role_expediteur' => $this->data['role_expediteur'],
            'role_destinataire' => $this->data['role_destinataire'],
            'objet' => $this->data['objet'] ?? null,
            'contenu' => $this->data['contenu'],
            'type' => $this->data['type'] ?? 'message',
            'priorite' => $this->data['priorite'] ?? 'normal',
            'categorie' => $this->data['categorie'] ?? null,
            'classe_id' => $this->data['classe_id'] ?? null,
        ]);
            $message->refresh();


        Log::info('createMessage', ['destinataire_id' => $destinataireId, 'element_lie_id' => $message->id]);
        return $message;
    }

    private function sendNotifications(Message $message, $eleveOrUser = null)
    {
        Log::info('sendNotifications', ['element_lie_id' => $message->id, 'destinataire_id' => $message->destinataire_id]);

        EnvoyerNotificationJob::dispatch([
            'user_id' => $message->destinataire_id,
            'type' => 'nouveau_message',
            'texte' => "Vous avez reçu un nouveau message : '{$message->objet}'",
            'element_lie_id' => $message->id,
             'type_element_lie' => 'message',
            'lu' => false,
        ]);

        if ($eleveOrUser instanceof Eleve && $eleveOrUser->parent && $eleveOrUser->parent->user_id) {
            Log::info('Notification parent', ['parent_user_id' => $eleveOrUser->parent->user_id]);
            EnvoyerNotificationJob::dispatch([
                'user_id' => $eleveOrUser->parent->user_id,
                'type' => 'nouveau_message',
                'texte' => "Votre enfant a reçu un message : '{$message->objet}'",
                'element_lie_id' => $message->id, // 👈 Ajouté
                 'type_element_lie' => 'message',
                'lu' => false,
            ]);
        }
    }
}
