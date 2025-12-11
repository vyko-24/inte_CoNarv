pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"

        // Aquí Jenkins carga automáticamente el secreto en texto plano
        FIREBASE_JSON_BASE64 = credentials('firebase-json-base64')
    }

    stages {

        stage('Stopping services') {
            steps {
                sh 'docker compose -p camilahoteles down || true'
            }
        }

        stage('Deleting old images') {
            steps{
                sh '''
                    IMAGES=$(docker images --filter "label=com.docker.compose.project=camilahoteles" -q)
                    if [ -n "$IMAGES" ]; then
                        docker rmi -f $IMAGES
                    fi
                '''
            }
        }

        stage('Pulling update') {
            steps {
                checkout scm
            }
        }

stage('Build JAR') {
    steps {
        sh '''
            docker run --rm \
                -v $PWD/server:/app \
                -w /app \
                maven:3.9.9-eclipse-temurin-21 \
                mvn clean package -DskipTests
        '''
    }
}


        stage('Build Backend Docker Image') {
            steps {
                sh '''
                docker build \
                    --build-arg FIREBASE_JSON_BASE64="${FIREBASE_JSON_BASE64}" \
                    -t services:camilahoteles-v1 \
                    ./server
                '''
            }
        }

        stage('Deploy containers') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}
