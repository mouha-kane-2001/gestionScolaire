pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    environment {
        BACKEND_IMAGE = "gestion-backend:latest"
        FRONTEND_IMAGE = "gestion-frontend:latest"
    }

    stages {

        /* ------------------------------
           1) Récupération du code
        ------------------------------ */
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/TON_USER/TON_REPO.git'
            }
        }

        /* ------------------------------
           2) BACKEND LARAVEL (apiGestionScolaire)
        ------------------------------ */
        stage('Backend - Build Image') {
            steps {
                sh """
                docker build -t ${BACKEND_IMAGE} ./apiGestionScolaire
                """
            }
        }

        stage('Backend - Tests') {
            steps {
                sh """
                docker run --rm ${BACKEND_IMAGE} php artisan test
                """
            }
        }

        /* ------------------------------
           3) FRONTEND ANGULAR (appGestionScolaire)
        ------------------------------ */
        stage('Frontend - Install & Build') {
            steps {
                sh """
                cd appGestionScolaire
                npm install
                npm run build
                """
            }
        }

        stage('Frontend - Build Image') {
            steps {
                sh """
                docker build -t ${FRONTEND_IMAGE} ./appGestionScolaire
                """
            }
        }

        /* ------------------------------
           FIN
        ------------------------------ */
        stage('Done') {
            steps {
                echo "Pipeline CI/CD exécutée avec succès !"
            }
        }
    }
}
