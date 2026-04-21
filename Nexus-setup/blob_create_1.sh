#!/bin/bash
NEXUS_USER="admin"
NEXUS_PASS="admin123"
NEXUS_URL="https://prelive.trainwithats.online/nexus"

# Create blob storge
for TYPE in "maven-rel" "maven-snap" "maven-proxy" "npm-rel" "npm-snap" "npm-proxy"; do
  curl -u "$NEXUS_USER:$NEXUS_PASS" -X POST "$NEXUS_URL/service/rest/v1/blobstores/file" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"trainwithats-$TYPE-blob\",
    \"path\": \"trainwithats-$TYPE-blob\"
  }"
done