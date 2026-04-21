#!/bin/bash
NEXUS_USER="admin"
NEXUS_PASS="admin123"
NEXUS_URL="https://prelive.trainwithats.online/nexus"

# 1. Maven Hosted Release
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/maven/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "maven-trainwithats-release",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-maven-rel-blob", "strictContentTypeValidation": true, "writePolicy": "allow_once" },
  "maven": { "versionPolicy": "RELEASE", "layoutPolicy": "STRICT" }
}'

# 2. Maven Hosted Snapshot
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/maven/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "maven-trainwithats-snapshot",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-maven-snap-blob", "strictContentTypeValidation": true, "writePolicy": "allow" },
  "maven": { "versionPolicy": "SNAPSHOT", "layoutPolicy": "STRICT" }
}'

# 3. Maven Proxy (Fixed with all mandatory proxy parameters)
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/maven/proxy" \
-H "Content-Type: application/json" \
-d '{
  "name": "maven-central-proxy",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-maven-proxy-blob", "strictContentTypeValidation": true },
  "proxy": { "remoteUrl": "https://repo1.maven.org/maven2/", "contentMaxAge": 1440, "metadataMaxAge": 1440 },
  "negativeCache": { "enabled": true, "timeToLive": 1440 },
  "httpClient": { "blocked": false, "autoBlock": true, "connection": { "retries": 2, "timeout": 60 } },
  "maven": { "versionPolicy": "RELEASE", "layoutPolicy": "STRICT" }
}'

# 4. NPM Hosted Release
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/npm/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "npm-trainwithats-release",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-npm-rel-blob", "strictContentTypeValidation": true, "writePolicy": "allow_once" }
}'

# 5. NPM Hosted Snapshot
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/npm/hosted" \
-H "Content-Type: application/json" \
-d '{
  "name": "npm-trainwithats-snapshot",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-npm-snap-blob", "strictContentTypeValidation": true, "writePolicy": "allow" }
}'

# 6. NPM Proxy (Fixed with all mandatory proxy parameters)
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/npm/proxy" \
-H "Content-Type: application/json" \
-d '{
  "name": "npm-proxy",
  "online": true,
  "storage": { "blobStoreName": "trainwithats-npm-proxy-blob", "strictContentTypeValidation": true },
  "proxy": { "remoteUrl": "https://registry.npmjs.org", "contentMaxAge": 1440, "metadataMaxAge": 1440 },
  "negativeCache": { "enabled": true, "timeToLive": 1440 },
  "httpClient": { "blocked": false, "autoBlock": true, "connection": { "retries": 2, "timeout": 60 } }
}'