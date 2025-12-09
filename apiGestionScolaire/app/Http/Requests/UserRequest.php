<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
    $userId = $this->route('utilisateur'); // récupère l'id depuis l'URL

    return [
             'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'email' => [
            'required',
            'email',
             Rule::unique('users', 'email')->ignore($userId), // 🔥 règle corrigée
            ],
            'role' => 'required|string|in:admin,parent,eleve,prof',
            'password' => $this->isMethod('post')
                ? 'required|string|min:6'
                : 'nullable|string|min:6',
        ];
}
}
