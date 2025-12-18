<?php

namespace App\Http\Controllers;

use App\Http\Requests\EleveRequest;
use App\Http\Requests\ParentRequest;
use App\Http\Requests\ProffesseurRequest;
use App\Http\Requests\UserRequest;
use App\Models\Admin;
use App\Models\Eleve;
use App\Models\ParentEleve;
use App\Models\Professeur;
use App\Models\User;
use Dotenv\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;


class UtilisateurController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role');
        $query = User::query();
        if ($role) {
            $query->where('role', $role);
        }
        return $query->get();
    }

       public function indexPagination(Request $request)
{
    $role = $request->query('role');
    $perPage = $request->query('perPage', 10); // par défaut 10
    $page = $request->query('page', 1);

    $query = User::query();

    if ($role) {
        $query->where('role', $role);
    }

    $utilisateurs = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

    return response()->json($utilisateurs);
}

   public function store(UserRequest $requestUser)
{
    $data = $requestUser->validated();

    $utilisateur = new User();
    $utilisateur->prenom = $data['prenom'];
    $utilisateur->nom = $data['nom'];
    $utilisateur->email = $data['email'];
    $utilisateur->role = $data['role'];
    $utilisateur->password = Hash::make($data['password']);
    $utilisateur->save();

    // Validation et création spécifique selon le rôle
     if ($data['role'] === 'eleve') {
        $matricule = strtoupper(substr($data['prenom'], 0, 2) . substr($data['nom'], 0, 2)) . time();

        // ✅ Créez directement sans re-valider (les données viennent déjà de UserRequest)
        Eleve::create([
            'user_id' => $utilisateur->id,
            'classe_id' => $requestUser->input('classe_id'),
            'matricule' => $matricule,
        ]);
    }

     // === ✅ CAS PROF ===
    elseif ($data['role'] === 'prof') {
        Professeur::create([
            'user_id' => $utilisateur->id,
            'matiere_id' => $requestUser->input('matiere_id'), // si tu as une matière
         ]);
    }
          elseif ($data['role'] === 'admin') {
    $matricule = strtoupper(substr($data['prenom'],0,2).substr($data['nom'],0,2)).time();

    // Création de l'enregistrement admin facultatif
    Admin::create([
        'user_id' => $utilisateur->id,
        'matricule' => $matricule, // ou null si tu ne veux pas le remplir
    ]);

    Log::info("Admin créé avec ID User: {$utilisateur->id}, Matricule: {$matricule}");
}

elseif ($data['role'] === 'parent') {
    Log::info("=== DÉBUT CRÉATION PARENT ===");

    // On crée le parent
    $parent = ParentEleve::create([
        'user_id'   => $utilisateur->id,
        'telephone' => $requestUser->input('telephone')
    ]);

    logger("Parent créé avec ID: " . $parent->id);

    // Récupérer les élèves IDs
    $elevesIds = $requestUser->input('elevesIds', []);
    logger("Élèves IDs reçus: " . json_encode($elevesIds));

    if (!empty($elevesIds)) {
        logger("=== VÉRIFICATION DES ÉLÈVES ===");

        // Vérifier TOUS les élèves dans la base
        $allEleves = Eleve::all();
        logger("Total élèves en base: " . $allEleves->count());
        foreach ($allEleves as $eleve) {
            logger("Élève disponible - ID: " . $eleve->id . ", Nom: " . $eleve->user->prenom . " " . $eleve->user->nom);
        }

        // Vérifier spécifiquement l'élève 21
        $eleve21 = Eleve::find(21);
        if ($eleve21) {
            logger("Élève 21 trouvé: " . $eleve21->id . " - User ID: " . $eleve21->user_id);
        } else {
            logger("Élève 21 NON TROUVÉ dans la base de données!");
        }

        // Essayer avec les IDs reçus
        $existingEleves = Eleve::whereIn('id', $elevesIds)->get();
        logger("Élèves correspondants trouvés: " . $existingEleves->count());

        if ($existingEleves->count() > 0) {
$updated = Eleve::whereIn('id', $elevesIds)->update(['parent_id' => $parent->id]);
            logger("Élèves mis à jour: " . $updated);
        }

        else {
            logger("AUCUN élève trouvé avec les IDs fournis!");
        }
    }

    return response()->json($utilisateur, 201);
}
}

    
    public function show($id)
    {
        $utilisateur = User::with([
        'eleve.classe',       // pour les élèves
        'professeur', // pour les profs
        'parentEleve.eleves'       // pour les parents
    ])->find($id);
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json($utilisateur);
    }

    public function update(UserRequest $request, $id)
{
    // Récupérer l'utilisateur
    $utilisateur = User::find($id);
    if (!$utilisateur) {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    // Valider les données
    $data = $request->validated();

    // Mise à jour des champs généraux
    $utilisateur->prenom = $data['prenom'];
    $utilisateur->nom = $data['nom'];
    $utilisateur->email = $data['email'];
    $utilisateur->role = $data['role'];

    if (!empty($data['password'])) {
        $utilisateur->password = Hash::make($data['password']);
    }

    $utilisateur->save();

    // Mise à jour selon le rôle
    if ($data['role'] === 'eleve') {
        $eleve = Eleve::where('user_id', $utilisateur->id)->first();
        if ($eleve) {
            $eleve->classe_id = $request->input('classe_id');
            $eleve->save();
        }
    } elseif ($data['role'] === 'prof') {
        $prof = Professeur::where('user_id', $utilisateur->id)->first();
        if ($prof) {
            $prof->matiere_id = $request->input('matiere_id');
            $prof->save();
        }
    } elseif ($data['role'] === 'admin') {
        $admin = Admin::where('user_id', $utilisateur->id)->first();
        if ($admin) {
            // Tu peux mettre à jour des champs de l'admin ici si nécessaire
            $admin->save();
        }
    } elseif ($data['role'] === 'parent') {
        $parent = ParentEleve::where('user_id', $utilisateur->id)->first();
        if ($parent) {
            $parent->telephone = $request->input('telephone', $parent->telephone);
            $parent->save();

            // Mettre à jour les élèves associés
            $elevesIds = $request->input('elevesIds', []);
            if (!empty($elevesIds)) {
                Eleve::whereIn('id', $elevesIds)->update(['parent_id' => $parent->id]);
            }
        }
    }

    return response()->json($utilisateur);
}


    public function destroy($id)
    {
        $utilisateur = User::find($id);
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
