<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Eleve;
use App\Models\ParentEleve;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email incorrect'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Mot de passe incorrect'], 401);
        }

        // Récupérer l'ID spécifique selon le rôle (TOUJOURS)
        $specificId = $this->getSpecificIdByRole($user);

        // Création du token JWT
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
            'specific_id' => $specificId // ✅ Toujours envoyé, quel que soit le rôle
        ]);
    }

    /**
     * Récupère l'ID spécifique selon le rôle de l'utilisateur
     */
    private function getSpecificIdByRole(User $user)
    {
        switch ($user->role) {
            case 'parent':
                $parent = ParentEleve::where('user_id', $user->id)->first();
                return $parent ? $parent->id : null;

            case 'eleve':
                $eleve = Eleve::where('user_id', $user->id)->first();
                return $eleve ? $eleve->id : null;

            case 'prof':
                $professeur = Professeur::where('user_id', $user->id)->first();
                return $professeur ? $professeur->id : null;

            case 'admin':
                $admin = Admin::where('user_id', $user->id)->first();
                return $admin ? $admin->id : null;

            default:
                return null;
        }
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }
}
