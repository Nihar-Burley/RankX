#!/bin/bash
NEXUS_USER="admin"
NEXUS_PASS="admin123"
NEXUS_URL="https://prelive.trainwithats.online/nexus"

# 1. Create Maven Group
# Note: Ensure the member names match EXACTLY what you created in the Hosted/Proxy steps
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/maven/group" \
-H "Content-Type: application/json" \
-d '{
  "name": "maven-trainwithats-group",
  "online": true,
  "storage": {
    "blobStoreName": "default",
    "strictContentTypeValidation": true
  },
  "group": {
    "memberNames": [
      "maven-trainwithats-release",
      "maven-trainwithats-snapshot",
      "maven-central-proxy"
    ]
  }
}'

# 2. Create NPM Group
curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/repositories/npm/group" \
-H "Content-Type: application/json" \
-d '{
  "name": "npm-trainwithats-group",
  "online": true,
  "storage": {
    "blobStoreName": "default",
    "strictContentTypeValidation": true
  },
  "group": {
    "memberNames": [
      "npm-trainwithats-release",
      "npm-trainwithats-snapshot",
      "npm-proxy"
    ]
  }
}'