<?php


return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
         // Pour Docker interne
        'http://localhost',           // Angular sur port 80 (depuis le navigateur)
        'http://127.0.0.1',           // Alternative IP
        'http://frontend',            // Nom du conteneur Angular (réseau Docker)
        'http://angular-frontend',    // Nom complet du conteneur
        'http://host.docker.internal', // Pour accéder à l'hôte depuis Docker

        // Pour développement local
        'http://localhost:4200',

        // Pour votre VPS
        'http://38.242.141.174',
        'http://38.242.141.174:8000',
        'http://38.242.141.174:4200',
    ],


    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization','X-Message', 'X-Error'],

    'max_age' => 0,

    'supports_credentials' => true,
];
