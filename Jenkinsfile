pipeline {
    agent any
    stages {
        stage('Check Tools') {
            steps {
                sh 'node -v'
                sh 'docker --version'
            }
        }
    }
}
