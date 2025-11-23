<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('groupe_id')->nullable()->after('id');

             // Expéditeur
            $table->unsignedBigInteger('expediteur_id');
             $table->unsignedBigInteger('destinataire_id')->nullable();
            $table->string('role_expediteur');

            // Destinataire (facultatif si c’est un envoi groupé)
            $table->foreign('expediteur_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('destinataire_id')->references('id')->on('users')->onDelete('set null');
            $table->string('role_destinataire')->nullable();

            // Pour les envois groupés
            $table->unsignedBigInteger('classe_id')->nullable(); // si message destiné à une classe entière
            $table->string('audience')->nullable();
            // exemples : 'tous_les_eleves', 'tous_les_parents', 'toute_la_classe', 'un_parent', etc.

            // Informations du message
            $table->string('objet')->nullable();
            $table->text('contenu');
            $table->string('type'); // message, convocation, annonce, alerte
            $table->enum('statut', ['non_lu', 'lu'])->default('non_lu');
            $table->string('priorite')->default('normal');
            $table->string('categorie')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
