pipeline {
    agent any
    stages {
        stage('Liste les fichiers') {
            steps {
                sh 'ls -l /workspace'
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
