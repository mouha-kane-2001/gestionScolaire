<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
  /**
     * Récupérer toutes les notifications d'un utilisateur
     * avec l'élément lié (note, message, convocation, etc.)
     */
    public function recupererNotifications($userId)
    {
        $notifications = Notification::where('user_id', $userId)
             ->get();

        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue
     */
    public function marquerCommeLu($notificationId)
    {
        $notification = Notification::findOrFail($notificationId);
        $notification->statut = 'lu';
        $notification->save();

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ]);
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    public function marquerToutesCommeLues($userId)
    {
        Notification::where('user_id', $userId)
            ->update(['statut' => 'lu']);

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues'
        ]);
    }
}
