#!/bin/bash

# Configuration
NEXUS_USER="admin"
NEXUS_PASS="admin123"
NEXUS_URL="https://prelive.trainwithats.online/nexus"

echo "🛠️ Starting RankX Docker Repository Setup..."

# 1. Create Blob Stores
echo "📦 Creating Blob Stores..."
for TYPE in "docker-rel" "docker-snap" "docker-proxy"; do
  curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/blobstores/file" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"trainwithats-$TYPE-blob\", \"path\": \"trainwithats-$TYPE-blob\"}"
  echo "✅ Created blob: trainwithats-$TYPE-blob"
done

# 2. Create Docker Hosted - Release (Port 8083)
echo "🚀 Creating Docker Hosted Release (Port 8083)..."
curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/docker/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "docker-trainwithats-release",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-docker-rel-blob", "strictContentTypeValidation": true, "writePolicy": "allow_once" },
  "docker": { "v1Enabled": false, "forceBasicAuth": true, "httpPort": 8083 }
}'

# 3. Create Docker Hosted - Snapshot (Port 8084)
echo "📸 Creating Docker Hosted Snapshot (Port 8084)..."
curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/docker/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "docker-trainwithats-snapshot",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-docker-snap-blob", "strictContentTypeValidation": true, "writePolicy": "allow" },
  "docker": { "v1Enabled": false, "forceBasicAuth": true, "httpPort": 8084 }
}'

# 4. Create Docker Proxy (Docker Hub)
echo "🌐 Creating Docker Hub Proxy..."
curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/docker/proxy" \
-H "Content-Type: application/json" \
-d '{
  "name": "docker-hub-proxy",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-docker-proxy-blob", "strictContentTypeValidation": true },
  "proxy": { "remoteUrl": "https://registry-1.docker.io", "contentMaxAge": 1440, "metadataMaxAge": 1440 },
  "negativeCache": { "enabled": true, "timeToLive": 1440 },
  "httpClient": { "blocked": false, "autoBlock": true, "connection": { "retries": 2, "timeout": 60 } },
  "docker": { "v1Enabled": false, "forceBasicAuth": true },
  "dockerProxy": { "indexType": "HUB" }
}'

# 5. Create Docker Group (Port 8082 - Pull All)
echo "🔗 Creating Docker Group (Port 8082)..."
curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/docker/group" \
-H "Content-Type: application/json" \
-d '{
  "name": "docker-trainwithats-group",
  "online": true,
  "storage": { "blobStoreName": "default", "strictContentTypeValidation": true },
  "docker": { "v1Enabled": false, "forceBasicAuth": true, "httpPort": 8082 },
  "group": { "memberNames": ["docker-trainwithats-release", "docker-trainwithats-snapshot", "docker-hub-proxy"] }
}'

# 6. Enable Docker Bearer Token Realm
echo "🔐 Enabling Docker Token Security Realm..."
curl -s -u "$NEXUS_USER:$NEXUS_PASS" -X PUT "$NEXUS_URL/service/rest/v1/security/realms/active" \
-H "Content-Type: application/json" \
-d '["LdapRealm", "DockerToken", "NpmToken", "NuGetApiKey", "InternalRealm"]'

echo "🎉 Setup Complete!"
echo "------------------------------------------------"
echo "Port 8082: Docker Group (PULL ALL)"
echo "Port 8083: Docker Release (PUSH)"
echo "Port 8084: Docker Snapshot (PUSH)"
echo "------------------------------------------------"