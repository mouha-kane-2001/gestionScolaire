<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AbsenceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'eleve_id' => 'required|exists:eleves,id',
            'classe_id' => 'required|exists:classes,id',
            'date_absence' => 'required|date',
            'matiere_id' => 'nullable|exists:matieres,id',
            'professeur_id' => 'nullable|exists:professeurs,id',
            'motif' => 'required|in:absent,retard,mauvaise_conduite,non_participation,non_travail,cours_manque,sans_billet,autre',
            'justifiee' => 'boolean',
            'commentaire' => 'nullable|string|max:500'
        ];
    }

    public function messages()
    {
        return [
            'eleve_id.required' => 'L\'élève est obligatoire.',
            'classe_id.required' => 'La classe est obligatoire.',
            'date_absence.required' => 'La date d\'absence est obligatoire.',
            'motif.required' => 'Le motif est obligatoire.',
            'motif.in' => 'Le motif sélectionné est invalide.'
        ];
    }
}
