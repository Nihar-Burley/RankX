#!/bin/bash
# Fixes framework versions across all services without touching app versions.

SPRING_BOOT="3.4.1"
SPRING_CLOUD="2024.0.0"

echo "Healing POM files..."

# Fix Spring Boot Parent Version
find . -name "pom.xml" -not -path "*/target/*" -exec sed -i '' \
    "/<artifactId>spring-boot-starter-parent<\/artifactId>/,/<\/parent>/ s/<version>.*<\/version>/<version>$SPRING_BOOT<\/version>/" {} +

# Fix Spring Cloud Dependency Management Version
find . -name "pom.xml" -not -path "*/target/*" -exec sed -i '' \
    "/<artifactId>spring-cloud-dependencies<\/artifactId>/,/<\/dependency>/ s/<version>.*<\/version>/<version>$SPRING_CLOUD<\/version>/" {} +

echo "Heal complete. Check a pom.xml to verify (Parent: $SPRING_BOOT, Cloud: $SPRING_CLOUD)."