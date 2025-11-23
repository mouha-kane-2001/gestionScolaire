<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // autoriser le prof connecté
    }

    public function rules(): array
    {
        return [
            'eleve_id' => 'required|exists:eleves,id',
            'matiere_id' => 'required|exists:matieres,id',
            'type' => 'required|in:devoir,examen',
            'valeur' => 'required|numeric|min:0|max:20',
            'periode' => 'nullable|string'
        ];
    }
}
