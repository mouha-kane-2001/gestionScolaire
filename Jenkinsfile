pipeline {
    agent any
    stages {
        stage('Debug PATH') {
            steps {
                sh 'echo $PATH'
                sh 'which node'
                sh 'which docker'
            }
        }
    }
}
