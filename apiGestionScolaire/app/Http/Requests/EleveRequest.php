<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EleveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
        'user_id' => 'required|exists:users,id', // ← CORRECTION: "users" pas "uers"
        'matricule' => 'required|string|unique:eleves,matricule,' . $this->id,
        'classe_id' => 'required|integer|exists:classes,id',
        'parent_id' => 'nullable|integer|exists:parents,id', // 🔑 lien vers parent
    ];
    }
}
