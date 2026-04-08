#!/bin/bash
# Final Robust Deployer - Version 2.0 Series
# This script overrides versions via CLI to keep POMs safe.

# List of services to process
SERVICES=("./submissionservice" "./api-gateway" "./quiz-service" "./attempt-service" "./question-service" "./problemservice" "./result-service" "./user-service" "./config-server" "./discovery-server")

for dir in "${SERVICES[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "Skipping $dir (Directory not found)"
        continue
    fi

    echo "--------------------------------------------------------"
    echo "Processing Service: $dir"
    echo "--------------------------------------------------------"

    # Push 5 RELEASE versions starting with 2.0.0
    for i in {0..4}; do
        NEW_VERSION="2.$i.0"
        echo "  -> Deploying version $NEW_VERSION..."

        # 1. Create a unique file to ensure a unique S3 blob/checksum
        mkdir -p "$dir/src/main/resources"
        echo "Release-Timestamp: $(date)" > "$dir/src/main/resources/build-info.txt"
        echo "Version: $NEW_VERSION" >> "$dir/src/main/resources/build-info.txt"

        # 2. Execute Deploy with version override
        # -Dproject.version= Overrides the version in the POM for this build only
        # -U Forces check for missing dependencies (Lombok/Cloud)
        (cd "$dir" && mvn clean deploy -Dproject.version=$NEW_VERSION -Dmaven.test.skip=true -q -U)

        if [ $? -eq 0 ]; then
            echo "     [SUCCESS] $NEW_VERSION is now in Nexus."
        else
            echo "     [FAILED] Could not upload $NEW_VERSION. Check if Nexus is reachable."
        fi
    done
done

echo "--------------------------------------------------------"
echo "All microservices have been populated with 2.x.x Releases!"