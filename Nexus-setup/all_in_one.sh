#!/bin/bash
# =================================================================
# Script: trainwithats-master-orch.sh
# Description: Enterprise-Grade Full-Stack Nexus Orchestrator
# Organization: TrainWithATS (ATS)
# =================================================================
set -o pipefail
set -e

# --- 1. SETTINGS & LOGGING ---
LOG_FILE="/var/log/nexus-ats-master.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] 🏗️  ATS-INFO: $1"; }
warn() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] ⚠️  ATS-WARN: $1" >&2; }
error() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] ❌ ATS-ERROR: $1" >&2; exit 1; }

# Cleanup trap for unexpected exits
trap 'echo "Script interrupted. Check $LOG_FILE for partial state."' SIGINT SIGTERM

# --- 2. DYNAMIC ENVIRONMENT DISCOVERY ---
log "🔍 Discovering AWS Environment for TrainWithATS..."

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600") || error "Failed to get IMDSv2 Token"
REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text) || error "AWS CLI / IAM Role check failed"

# Dynamic Bucket Discovery: Sniffs for your Terraform-created bucket
S3_BUCKET=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'nexus-blobs')].Name" --output text | tr '\t' '\n' | grep "$ACCOUNT_ID" | head -n 1)

[[ -z "$S3_BUCKET" ]] && error "Discovery Failed: No S3 bucket found matching 'nexus-blobs' in account $ACCOUNT_ID."
log "✅ Found Infrastructure: Region=$REGION | Bucket=$S3_BUCKET"

# --- 3. NEXUS API ENGINE ---
NEXUS_USER="admin"
NEXUS_PASS=$(cat /nexus-data/admin.password 2>/dev/null || echo "admin123")
API_URL="https://prelive.trainwithats.online/nexus/service/rest/v1"

# Exponential Backoff Wait
wait_for_nexus() {
    log "⏳ Waiting for Nexus API health check..."
    local attempt=1
    until curl -s -u "$NEXUS_USER:$NEXUS_PASS" "$API_URL/status" > /dev/null; do
        [[ $attempt -eq 15 ]] && error "Nexus API timed out."
        log "Nexus booting (Attempt $attempt)... waiting 10s"
        sleep 10
        attempt=$((attempt+1))
    done
    log "✅ Nexus API is online."
}

# Unified Idempotent Request Handler
nexus_api() {
    local method=$1; local endpoint=$2; local name=$3; local payload=$4; local check_path=$5

    # Check if resource already exists
    if [[ "$method" == "POST" && "$(curl -s -o /dev/null -w "%{http_code}" -u "$NEXUS_USER:$NEXUS_PASS" "$API_URL/$check_path/$name")" == "200" ]]; then
        log "⏭️  $name exists. Skipping."
        return 0
    fi

    log "🚀 Deploying $name..."
    local response=$(curl -s -w "\n%{http_code}" -u "$NEXUS_USER:$NEXUS_PASS" \
        -X "$method" "$API_URL/$endpoint" -H "Content-Type: application/json" -d "$payload")

    local status=$(echo "$response" | tail -n1)
    [[ "$status" =~ ^2 ]] && log "✅ Success: $name" || warn "Issue with $name: HTTP $status"
}

# --- 4. EXECUTION PHASE ---

wait_for_nexus

# --- STEP A: DYNAMIC S3 BLOBS ---
log "🏗️  Provisioning S3-Backed Storage..."
CATEGORIES=("docker" "maven" "npm")
TYPES=("rel" "snap" "proxy")

for CAT in "${CATEGORIES[@]}"; do
    for TYPE in "${TYPES[@]}"; do
        BLOB_NAME="trainwithats-$CAT-$TYPE-s3"
        JSON_BLOB=$(cat <<EOF
{
  "name": "$BLOB_NAME",
  "bucketConfiguration": {
    "bucket": "$S3_BUCKET",
    "prefix": "$CAT/$TYPE/",
    "region": "$REGION",
    "authentication": { "type": "iam" }
  }
}
EOF
)
        nexus_api "POST" "blobstores/s3" "$BLOB_NAME" "$JSON_BLOB" "blobstores"
    done
done

# --- STEP B: MAVEN SUITE ---
log "📦 Configuring Maven Infrastructure..."
nexus_api "POST" "repositories/maven/hosted" "trainwithats-maven-release" '{"name": "trainwithats-maven-release", "online": true, "storage": {"blobStoreName": "trainwithats-maven-rel-s3", "writePolicy": "allow_once"}, "maven": {"versionPolicy": "RELEASE"}}' "repositories"
nexus_api "POST" "repositories/maven/hosted" "trainwithats-maven-snapshot" '{"name": "trainwithats-maven-snapshot", "online": true, "storage": {"blobStoreName": "trainwithats-maven-snap-s3", "writePolicy": "allow"}, "maven": {"versionPolicy": "SNAPSHOT"}}' "repositories"
nexus_api "POST" "repositories/maven/proxy" "trainwithats-maven-proxy" '{"name": "trainwithats-maven-proxy", "online": true, "storage": {"blobStoreName": "trainwithats-maven-proxy-s3"}, "proxy": {"remoteUrl": "https://repo1.maven.org/maven2/"}}' "repositories"
nexus_api "POST" "repositories/maven/group" "trainwithats-maven-group" '{"name": "trainwithats-maven-group", "online": true, "group": {"memberNames": ["trainwithats-maven-release", "trainwithats-maven-snapshot", "trainwithats-maven-proxy"]}}' "repositories"

# --- STEP C: NPM SUITE ---
log "📦 Configuring NPM Infrastructure..."
nexus_api "POST" "repositories/npm/hosted" "trainwithats-npm-hosted" '{"name": "trainwithats-npm-hosted", "online": true, "storage": {"blobStoreName": "trainwithats-npm-rel-s3"}}' "repositories"
nexus_api "POST" "repositories/npm/proxy" "trainwithats-npm-proxy" '{"name": "trainwithats-npm-proxy", "online": true, "storage": {"blobStoreName": "trainwithats-npm-proxy-s3"}, "proxy": {"remoteUrl": "https://registry.npmjs.org"}}' "repositories"
nexus_api "POST" "repositories/npm/group" "trainwithats-npm-group" '{"name": "trainwithats-npm-group", "online": true, "group": {"memberNames": ["trainwithats-npm-hosted", "trainwithats-npm-proxy"]}}' "repositories"

# --- STEP D: DOCKER SUITE (8082, 8083, 8084) ---
log "📦 Configuring Docker Infrastructure..."
nexus_api "POST" "repositories/docker/hosted" "trainwithats-docker-release" '{"name": "trainwithats-docker-release", "online": true, "storage": {"blobStoreName": "trainwithats-docker-rel-s3", "writePolicy": "allow_once"}, "docker": {"httpPort": 8083}}' "repositories"
nexus_api "POST" "repositories/docker/hosted" "trainwithats-docker-snapshot" '{"name": "trainwithats-docker-snapshot", "online": true, "storage": {"blobStoreName": "trainwithats-docker-snap-s3", "writePolicy": "allow"}, "docker": {"httpPort": 8084}}' "repositories"
nexus_api "POST" "repositories/docker/proxy" "trainwithats-docker-hub" '{"name": "trainwithats-docker-hub", "online": true, "storage": {"blobStoreName": "trainwithats-docker-proxy-s3"}, "proxy": {"remoteUrl": "https://registry-1.docker.io"}, "dockerProxy": {"indexType": "HUB"}}' "repositories"
nexus_api "POST" "repositories/docker/group" "trainwithats-docker-group" '{"name": "trainwithats-docker-group", "online": true, "docker": {"httpPort": 8082}, "group": {"memberNames": ["trainwithats-docker-release", "trainwithats-docker-snapshot", "trainwithats-docker-hub"]}}' "repositories"

# --- STEP E: SECURITY & FINISH ---
log "🔐 Hardening Security Realms..."
nexus_api "PUT" "security/realms/active" "realms" '["LdapRealm", "DockerToken", "NpmToken", "InternalRealm"]' "security/realms"

log "🏁 SUCCESS: TrainWithATS Full-Stack Deployment Complete."