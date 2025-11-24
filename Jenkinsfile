pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        APP_DIR = '/home/john/rollbook'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                echo '🔨 Building Next.js application...'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying to production...'
                sh '''
                    # 빌드 결과물을 운영 디렉토리로 복사
                    rsync -av --delete .next/ ${APP_DIR}/.next/
                    rsync -av src/ ${APP_DIR}/src/

                    # Docker 컨테이너 재시작
                    docker restart rollbook
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment successful!'
        }
        failure {
            echo '❌ Build or deployment failed!'
        }
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
