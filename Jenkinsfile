pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "gestion-backend:latest"
        FRONTEND_IMAGE = "gestion-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/mouha-kane-2001/gestionScolaire.git'
            }
        }

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

        stage('Done') {
            steps {
                echo "Pipeline CI/CD exécutée avec succès !"
            }
        }
    }
}
