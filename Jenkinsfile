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

    }

    post {
        success {
            echo 'JewelKart CI Pipeline completed successfully!'
        }

        failure {
            echo 'JewelKart CI Pipeline failed!'
        }
    }
}