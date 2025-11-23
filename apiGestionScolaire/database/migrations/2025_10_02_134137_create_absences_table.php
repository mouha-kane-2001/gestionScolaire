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
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('eleve_id');
            $table->date('date_absence');
            $table->string('motif')->nullable();   // optionnel : ex "maladie", "non justifié"
            $table->timestamps();
            $table->foreignId('professeur_id')->constrained('professeurs');
            $table->boolean('justifiee')->default(false)->after('motif');
            $table->foreignId('matiere_id')->constrained();
            $table->foreign('eleve_id')->references('id')->on('eleves')->onDelete('cascade');
             $table->unique(['eleve_id', 'date_absence', 'matiere_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
