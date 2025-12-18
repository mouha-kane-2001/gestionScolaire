<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        // Définir les origines autorisées
        $allowedOrigins = [
            'http://localhost:4200',      // Développement
            'http://38.242.141.174',      // VPS (Angular sur port 80)
            'http://38.242.141.174:8000', // VPS (Laravel)
            'https://38.242.141.174',
            'http://localhost',    // VPS avec HTTPS
        ];

        // Vérifier l'origine de la requête
        $origin = $request->headers->get('Origin');

        // Si l'origine est dans la liste autorisée, l'utiliser, sinon utiliser la première
        $allowedOrigin = in_array($origin, $allowedOrigins) ? $origin : $allowedOrigins[0];

        // Gérer la requête OPTIONS (preflight)
        if ($request->getMethod() === "OPTIONS") {
            return response()->json([], 200)
                ->header('Access-Control-Allow-Origin', $allowedOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Expose-Headers', 'Authorization, X-Message, X-Error');
        }

        $response = $next($request);

        // Ajouter les headers CORS
        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Expose-Headers', 'Authorization, X-Message, X-Error');
        $response->headers->set('Access-Control-Max-Age', '86400'); // 24 heures

        return $response;
    }
}
