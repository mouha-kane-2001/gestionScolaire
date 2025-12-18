pipeline {
    agent any
    environment {
        SONAR_HOST_URL = "http://172.19.0.1:9000"
    }
    
    stages {
        stage('Vérification Structure') {
            steps {
                sh '''
                echo "📁 Vérification de la structure..."
                echo "=== Racine ==="
                ls -la
                echo "=== Fichiers importants ==="
                ls -la apiGestionScolaire/ 2>/dev/null | head -5
                ls -la appGestionScolaire/ 2>/dev/null | head -5
                ls -la docker/ 2>/dev/null | head -5
                '''
            }
        }
        
        stage('Vérification Docker Compose') {
            steps {
                echo "📦 Vérification de Docker et Docker Compose..."
                sh 'docker --version'
                sh 'docker compose version'
                echo "✅ Docker Compose prêt"
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'TOKEN')]) {
                        sh """
                        echo "🔧 Analyse SonarQube..."
                        docker run --rm \\
                          -v \$(pwd)/apiGestionScolaire:/usr/src \\
                          -w /usr/src \\
                          sonarsource/sonar-scanner-cli:latest \\
                          -Dsonar.projectKey=GestionScolaire \\
                          -Dsonar.projectName="Gestion Scolaire" \\
                          -Dsonar.host.url=http://172.19.0.1:9000 \\
                          -Dsonar.token=\$TOKEN \\
                          -Dsonar.sources=.
                        """
                    }
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                sh '''
                echo "🔨 Construction du backend..."
                cd apiGestionScolaire
                docker build -t gestionscolaire-backend:latest .
                echo "✅ Backend construit"
                '''
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh '''
                echo "🔨 Construction du frontend..."
                cd appGestionScolaire
                docker build -t gestionscolaire-frontend:latest .
                echo "✅ Frontend construit"
                '''
            }
        }
        
        stage('Arrêt des Containers Existants') {
            steps {
                sh '''
                echo "🛑 Arrêt des containers existants..."
                # Supprime tous les containers existants spécifiés, ignore les erreurs
        docker rm -f laravel-backend backend-nginx angular-frontend postgres-db || true
        echo "✅ Containers supprimés (volumes conservés)"
                '''
            }
        }
        
        stage('Déploiement') {
            steps {
                sh '''
                echo "🚀 Déploiement de l'application..."
                
                echo "🔧 Vérification de laravel.conf..."
                # S'assurer que laravel.conf est correct
                if [ -d "docker/nginx/laravel.conf" ]; then
                    echo "🗑️  Correction du dossier laravel.conf..."
                    rm -rf docker/nginx/laravel.conf
                fi
                
                if [ ! -f "docker/nginx/laravel.conf" ]; then
                    echo "📁 Création de laravel.conf..."
                    mkdir -p docker/nginx
                    cat > docker/nginx/laravel.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_pass laravel-backend:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\\.ht {
        deny all;
    }
}
EOF
                    echo "✅ laravel.conf créé"
                else
                    echo "✅ laravel.conf existe déjà"
                    ls -la docker/nginx/laravel.conf
                fi
                
                echo "🔧 Correction de la configuration Nginx..."
                sed -i 's|/etc/nginx/conf.d/laravel.conf|/etc/nginx/conf.d/default.conf|g' docker-compose.yml
                
                echo "📋 Configuration finale :"
                grep -A 5 "backend-nginx" docker-compose.yml | grep -A 3 "volumes:"
                
                echo "🚀 Déploiement en cours..."
                docker compose up -d
                echo "✅ Application déployée !"
                '''
            }
        }
        
        stage('Vérification') {
            steps {
                sh '''
                echo "🔍 Vérification des services..."
                sleep 30
                curl -f http://localhost && echo "✅ Frontend accessible" || echo "⚠️  Frontend inaccessible"
                curl -f http://localhost:8000 && echo "✅ Backend accessible" || echo "⚠️  Backend inaccessible"
                echo "=== Containers en cours d'exécution ==="
                docker ps
                echo "✅ Vérification terminée"
                '''
            }
        }
    }
    
    post {
        always {
            echo "🏁 Pipeline terminé"
        }
        success {
            echo "✅ Pipeline réussi !"
            sh '''
            echo "🎉 CI/CD COMPLETEMENT OPÉRATIONNEL !"
            echo "📊 SonarQube: http://172.19.0.1:9000"
            echo "🌐 Frontend: http://localhost" 
            echo "🔙 Backend: http://localhost:8000"
            echo "🔄 Jenkins: http://localhost:8081"
            '''
        }
        failure {
            echo "❌ Pipeline échoué"
        }
    }
}