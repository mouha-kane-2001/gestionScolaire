<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'type' => 'required|in:devoir,examen',
            'periode' => 'required|in:trimestre1,trimestre2',
            'numero' => 'required_if:type,devoir|integer|min:1|max:10',
            'commentaire' => 'nullable|string|max:500',
            'notes' => 'required|array|min:1',
            'notes.*.eleve_id' => 'required|integer|exists:eleves,id',
            'notes.*.valeur' => 'required|numeric|min:0|max:20'
        ];
    }

    public function messages(): array
    {
        return [
            'notes.required' => 'Au moins une note est requise',
            'notes.*.eleve_id.required' => 'L\'ID de l\'élève est requis pour chaque note',
            'notes.*.valeur.required' => 'La valeur de la note est requise',
            'notes.*.valeur.min' => 'La note doit être au moins 0',
            'notes.*.valeur.max' => 'La note ne peut pas dépasser 20',
        ];
    }
}
