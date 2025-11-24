pipeline {
    agent any
    stages {
        stage('Liste les fichiers') {
            steps {
                git branch: 'main', url: 'https://github.com/mouha-kane-2001/gestionScolaire.git'
            }
        }

        stage('Check Tools') {
            steps {
                sh 'node -v'
                sh 'docker --version'
            }
        }
    }
}
