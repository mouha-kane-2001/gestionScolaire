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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
           $table->unsignedBigInteger('user_id');
// ID de l’élément lié à la notification (message, note, absence, convocation, etc.)
$table->unsignedBigInteger('element_lie_id')->nullable();

// Type de l’élément lié (message, note, absence, convocation, etc.)
$table->string('type_element_lie')->nullable();
$table->string('type');
            $table->text('texte');
            $table->enum('statut', ['non_lu','lu'])->default('non_lu');

            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
         });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
