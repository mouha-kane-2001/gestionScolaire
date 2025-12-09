<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => 'required|array|min:1',
            'notes.*.note_id' => 'required|integer|exists:notes,id',
            'notes.*.valeur' => 'required|numeric|min:0|max:20',
            'notes.*.commentaire' => 'nullable|string|max:500'
        ];
    }

    public function messages(): array
    {
        return [
            'notes.required' => 'Au moins une note à modifier est requise',
            'notes.*.note_id.required' => 'L\'ID de la note est requis',
            'notes.*.note_id.exists' => 'La note n\'existe pas',
            'notes.*.valeur.required' => 'La valeur de la note est requise',
            'notes.*.valeur.numeric' => 'La note doit être un nombre',
            'notes.*.valeur.min' => 'La note doit être au moins 0',
            'notes.*.valeur.max' => 'La note ne peut pas dépasser 20',
        ];
    }
}
