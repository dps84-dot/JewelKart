pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out JewelKart source code...'
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                echo 'Checking Jenkins environment...'

                bat 'git --version'
                bat 'docker --version'
                bat 'docker compose version'
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                echo 'Running SonarQube code analysis...'

                script {
                    def scannerHome = tool 'SonarQubeScanner'

                    withSonarQubeEnv('SonarQube') {
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\" " +
                            "-Dsonar.projectKey=jewelkart " +
                            "-Dsonar.projectName=JewelKart " +
                            "-Dsonar.sources=backend/src,frontend/src " +
                            "-Dsonar.sourceEncoding=UTF-8 " +
                            "-Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**"
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                echo 'Building JewelKart backend Docker image...'

                bat 'docker build -t jewelkart-backend:jenkins ./backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                echo 'Building JewelKart frontend Docker image...'

                bat 'docker build -t jewelkart-frontend:jenkins ./frontend'
            }
        }

        stage('Tag Docker Images') {
            steps {
                echo 'Tagging Docker images for deployment...'

                bat 'docker tag jewelkart-backend:jenkins jewelkart-backend:1.0'
                bat 'docker tag jewelkart-frontend:jenkins jewelkart-frontend:1.0'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo 'Deploying JewelKart using Docker Compose...'

                bat 'docker compose -p jewelkart down'
                bat 'docker compose -p jewelkart up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying JewelKart deployment...'

                bat 'docker ps'

                bat 'powershell -Command "Invoke-WebRequest http://localhost:5000/api/health -UseBasicParsing"'
            }
        }
    }

    post {
        success {
            echo 'JewelKart CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'JewelKart CI/CD Pipeline failed!'
        }
    }
}