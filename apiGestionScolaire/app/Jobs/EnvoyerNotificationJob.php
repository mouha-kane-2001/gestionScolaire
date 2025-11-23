<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\Eleve;
use App\Models\ParentEleve;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnvoyerNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        try {
            // 🔥 NOUVEAU : Gestion des notifications groupées
            if (isset($this->data['groupe_type'])) {
                $this->handleGroupeNotification();
            } else {
                // 🔥 ANCIEN : Notification individuelle
                $this->handleIndividualNotification();
            }

        } catch (\Exception $e) {
            Log::error('Erreur création notification: ' . $e->getMessage());
        }
    }

    /**
     * Gère les notifications individuelles
     */
    private function handleIndividualNotification(): void
    {
        if (!isset($this->data['user_id']) || !isset($this->data['texte'])) {
            Log::warning('Données manquantes pour notification individuelle', $this->data);
            return;
        }

        Notification::create([
            'user_id' => $this->data['user_id'],
            'type'    => $this->data['type'] ?? 'general',
            'texte'   => $this->data['texte'],
            'element_lie_id' => $this->data['element_lie_id'] ?? null,
            'type_element_lie' => $this->data['type_element_lie'] ?? null,
            'lu'      => $this->data['lu'] ?? false,
        ]);

        Log::info("Notification individuelle créée pour user_id: {$this->data['user_id']}");
    }

    /**
     * Gère les notifications groupées
     */
    private function handleGroupeNotification(): void
    {
        $groupeType = $this->data['groupe_type'];
        $texte = $this->data['texte'] ?? '';
        $type = $this->data['type'] ?? 'general';

        // Récupérer les utilisateurs selon le type de groupe
        $users = match($groupeType) {
            'tous_eleves' => Eleve::with('user')->get()->pluck('user.id')->filter(),
            'tous_parents' => ParentEleve::with('user')->get()->pluck('user.id')->filter(),
            'tous_profs' => Professeur::with('user')->get()->pluck('user.id')->filter(),
            'tous_admins' => User::where('role', 'admin')->pluck('id'),
            'classe' => $this->getUsersFromClasse($this->data['classe_id'] ?? null),
            default => collect(),
        };

        $count = 0;
        foreach ($users as $userId) {
            if ($userId) {
                Notification::create([
                    'user_id' => $userId,
                    'type'    => $type,
                    'texte'   => $texte,
                     'element_lie_id' => $this->data['element_lie_id'] ?? null,
    'type_element_lie' => $this->data['type_element_lie'] ?? null,
                    'lu'      => false,
                ]);
                $count++;
            }
        }

        Log::info("Notifications groupées créées: {$count} pour le groupe {$groupeType}");
    }

    /**
     * Récupère les users d'une classe (élèves + parents)
     */
    private function getUsersFromClasse($classeId): array
    {
        if (!$classeId) return [];

        $eleves = Eleve::with(['user', 'parent.user'])
            ->where('classe_id', $classeId)
            ->get();

        $userIds = [];

        foreach ($eleves as $eleve) {
            // Ajouter l'élève
            if ($eleve->user_id) {
                $userIds[] = $eleve->user_id;
            }
            // Ajouter le parent
            if ($eleve->parent && $eleve->parent->user_id) {
                $userIds[] = $eleve->parent->user_id;
            }
        }

        return array_unique($userIds);
    }
}
