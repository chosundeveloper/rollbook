#!/bin/bash
# Jenkins Job 자동 생성 스크립트

JENKINS_URL="http://172.30.1.46:8080"
JOB_NAME="rollbook-pipeline"
JENKINS_USER="admin"
JENKINS_PASSWORD="12121212"

# Job Config XML
cat > /tmp/jenkins-job.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description>Rollbook 자동 빌드 및 배포</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.10.0">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>/home/john/rollbook/.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

echo "Jenkins Job 생성 중..."

# Job 생성
curl -X POST "$JENKINS_URL/createItem?name=$JOB_NAME" \
  --user "$JENKINS_USER:$JENKINS_PASSWORD" \
  --header "Content-Type: application/xml" \
  --data-binary @/tmp/jenkins-job.xml

echo ""
echo "Job 생성 완료!"
echo ""
echo "빌드 실행 중..."

# 빌드 시작
curl -X POST "$JENKINS_URL/job/$JOB_NAME/build" \
  --user "$JENKINS_USER:$JENKINS_PASSWORD"

echo ""
echo "✅ 빌드가 시작되었습니다!"
echo ""
echo "확인: $JENKINS_URL/job/$JOB_NAME/"
