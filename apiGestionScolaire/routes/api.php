<?php

use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\ConvocationController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\ProfController;
use App\Http\Controllers\UtilisateurController;
use Illuminate\Support\Facades\Route;


Route::get('/matieres', [MatiereController::class, 'index']);
Route::get('/classes', [ClasseController::class, 'index']);
Route::apiResource('utilisateurs',UtilisateurController::class);
Route::get('eleves/elevesAvecmatricule', [EleveController::class, 'getElevesAvecMatricule']);

// ✅ Routes messages correctes
Route::prefix('messages')->group(function () {
    Route::get('/', [MessageController::class, 'index']); // Envoi d'un message
        Route::post('/', [MessageController::class, 'envoyerMessage']); // Envoi d'un message

    Route::get('/sent/{id}', [MessageController::class, 'getSentMessages']); // Messages envoyés
    Route::get('/received/{id}', [MessageController::class, 'getReceivedMessages']); // Messages reçus
});
Route::get('/classes/performance', [ClasseController::class, 'performanceParClasse']);
Route::get('/absences/taux', [AbsenceController::class, 'tauxParClasse']);


// Récupérer toutes les notes
Route::get('/notes', [NoteController::class, 'index']);

// Attribuer une note à un élève
Route::post('/notes/attribuer', [NoteController::class, 'store']);

// Récupérer les notes d'un élève spécifique
Route::get('/notes/eleve/{eleveId}', [NoteController::class, 'getNotesParEleve']);

// Modifier une note
Route::put('/notes/{noteId}', [NoteController::class, 'update']);

// Supprimer une note
Route::delete('/notes/{noteId}', [NoteController::class, 'destroy']);

// Pour l'élève : récupérer ses notes
Route::get('/notes/eleve/{eleveId}', [NoteController::class, 'notesEleve']);

    // Pour le parent : récupérer les notes de ses enfants
Route::get('/notes/parent/{parentId}', [NoteController::class, 'notesParent']);

Route::get('/utilisateurs/parent/{parentId}/enfants', [ParentController::class, 'enfants']);



Route::group([
    'prefix' => 'Auth'
], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('profile', [AuthController::class, 'profile'])->middleware('auth:api');
});


Route::prefix('absences')->group(function () {
    // Marquer une absence
    Route::post('/', [AbsenceController::class, 'store']);
    Route::get('/', [AbsenceController::class, 'index']);

    // Récupérer les absences d'un élève
    Route::get('/eleve/{eleveId}', [AbsenceController::class, 'absencesEleve']);
    // Récupérer les absences des enfants d'un parent
     Route::get('/parent/{parentId}', [AbsenceController::class, 'absencesParParent']);

     // Dans api.php (routes)
Route::get('/du-jour', [AbsenceController::class, 'getAbsencesDuJour']);
Route::delete('/', [AbsenceController::class, 'supprimerAbsence']);


});
Route::get('/classes/prof/{id}', [ClasseController::class, 'getClassesDuProfesseur']);
Route::get('/professeurs', [ProfController::class, 'index']);
Route::post('/professeurs/affecterClasses', [ProfController::class, 'affecterClasse']);


Route::apiResource('convocations',ConvocationController::class);
Route::get('/convocations/parent/{parentId}', [ConvocationController::class, 'getByParent']);


Route::prefix('notifications')->group(function () {
    // Récupérer toutes les notifications d'un utilisateur
Route::get('/user/{id}', [NotificationController::class, 'recupererNotifications']);

    // Marquer une notification comme lue
    Route::put('/marquer-lu/{notificationId}', [NotificationController::class, 'marquerCommeLu']);

    // Marquer toutes les notifications d'un utilisateur comme lues
    Route::put('/marquer-toutes-lu/{userId}', [NotificationController::class, 'marquerToutesCommeLues']);
});


// routes/api.php
Route::get('/convocations', [ConvocationController::class, 'index']);
 Route::get('convocations/eleve/{eleveId}', [ConvocationController::class, 'getByEleve']);

Route::get('/notes/all', [NoteController::class, 'index']);







Route::get('/notes/prof/{profId}', [NoteController::class, 'getNotesByProf']);
Route::get('/notes/prof/{profId}', [NoteController::class, 'getNotesByProf']);
Route::get('/eleves/prof/{profId}', [UtilisateurController::class, 'getElevesByProf']);
Route::get('/absences/prof/{profId}', [AbsenceController::class, 'getAbsencesByProf']);
