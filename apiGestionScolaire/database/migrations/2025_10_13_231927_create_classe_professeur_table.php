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
        Schema::create('classe_professeur', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('classe_id');
            $table->unsignedBigInteger('professeur_id');
            $table->timestamps();

            $table->foreign('classe_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('professeur_id')->references('id')->on('professeurs')->onDelete('cascade');
            $table->unique(['classe_id', 'professeur_id']);

             
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classe_professeur');
    }
};
