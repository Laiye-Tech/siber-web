@Library('laiye') _

pipeline {
    environment {
        PROJECT = 'siber-web'
    }
    agent any
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '30', numToKeepStr: '3')
    }
    stages {
        stage('process: siber-web base image') {
            when { tag "baseimg" }
            agent any
            stages {
                stage('Build siber-web base image') {
                    steps {
                        script {
                            backend.build_base_image("${env.PROJECT}","${env.BRANCH_NAME}")
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            failFast true
            parallel {
                

                stage('process: siber-web') {
                    when { tag "v*" }
                    agent any
                    stages {
                        stage('Prod') {
                            steps {
                                script {
                                    backend.debug_handler()
                                }
                            }
                        }
                        stage('Build siber-web image') {
                            steps {
                                echo "siber-web"
                                script {
                                    frontend.build_image_by_docker("${env.PROJECT}", "siber-web","${env.BRANCH_NAME}", "./docker/Dockerfile")
                                }
                            }
                        }
                    }
                }
                stage('deploy siber-web to saas-test') {
                    agent any
                    when { branch "tes*" }
                    steps {
                        script {
                            frontend.saas_test_deploy("${env.PROJECT}", "siber-web", "./docker/Dockerfile")
                        }
                    }
                }
                
                stage('deploy siber-web to test kube cluster') {
                    agent any
                    when { branch "dev" }
                    steps {
                        script {
                            frontend.test_env_deploy_to_kube("${env.PROJECT}", "siber-web", "./docker/Dockerfile")
                        }
                    }
                }
                
            }
        }
    }
}
