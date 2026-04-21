#!/bin/bash
# RankX Master Deployer - Automated POM Versioning

# ✅ List of your 10 Java services
SERVICES=(
  "./submissionservice"
  "./api-gateway"
  "./quiz-service"
  "./attempt-service"
  "./question-service"
  "./problemservice"
  "./result-service"
  "./user-service"
  "./config-server"
  "./discovery-server"
)

for dir in "${SERVICES[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "⚠️ Skipping $dir (Directory not found)"
        continue
    fi

    echo "========================================================"
    echo "🏗️  BUILDING & VERSIONING: $dir"
    echo "========================================================"

    # --- PHASE 1: SNAPSHOTS ---
    # We set the version to 1.0.0-SNAPSHOT and push 2 builds
    echo "🚀 Phase 1: Setting version to 1.0.0-SNAPSHOT"
    (cd "$dir" && mvn versions:set -DnewVersion=1.0.0-SNAPSHOT -DgenerateBackupPoms=false -q)

    for i in {1..2}; do
        echo "  -> Pushing Snapshot Build #$i..."
        (cd "$dir" && mvn clean deploy -Dmaven.test.skip=true -q -U)
        if [ $? -eq 0 ]; then
            echo "     ✅ Success: Snapshot #$i"
        else
            echo "     ❌ Failed: Snapshot #$i (Check Nexus/ALB)"
        fi
    done

    # --- PHASE 2: RELEASES ---
    # We loop through 1.0.1 and 1.0.2, updating the pom.xml each time
    echo "🎯 Phase 2: Starting Release Cycle..."
    for i in {1..2}; do
        REL_VER="1.0.$i"
        echo "  -> Updating pom.xml to version: $REL_VER"
        (cd "$dir" && mvn versions:set -DnewVersion=$REL_VER -DgenerateBackupPoms=false -q)

        echo "  -> Deploying Release $REL_VER..."
        (cd "$dir" && mvn clean deploy -Dmaven.test.skip=true -q -U)

        if [ $? -eq 0 ]; then
            echo "     ✅ Success: $REL_VER pushed to Nexus"
        else
            echo "     ❌ Failed: $REL_VER"
        fi
    done

    # --- RESET ---
    # Revert to Snapshot so your local IDE doesn't complain
    (cd "$dir" && mvn versions:set -DnewVersion=1.0.0-SNAPSHOT -DgenerateBackupPoms=false -q)
done

echo "========================================================"
echo "🎊 FINISHED! Versions updated and artifacts deployed."
echo "========================================================"















##!/bin/bash
## RankHex Microservices Mass Deployer - Release & Snapshot
## Using -Dproject.version for clean, multi-version population
#
## ✅ List of all 10 Java services
#SERVICES=("./submissionservice" "./api-gateway" "./quiz-service" "./attempt-service" "./question-service" "./problemservice" "./result-service" "./user-service" "./config-server" "./discovery-server")
#
#for dir in "${SERVICES[@]}"; do
#    if [ ! -d "$dir" ]; then
#        echo "⚠️ Skipping $dir (Directory not found)"
#        continue
#    fi
#
#    echo "========================================================"
#    echo "🏗️  STARTING DEPLOYMENT FOR: $dir"
#    echo "========================================================"
#
#    # --- PHASE 1: 10 SNAPSHOT ITERATIONS ---
#    echo "🚀 Phase 1: Uploading 10 SNAPSHOTS to Nexus..."
#    for i in {1..10}; do
#        SNAP_VERSION="1.0.0-SNAPSHOT"
#
#        # Add unique data so Nexus sees a new build/timestamp
#        mkdir -p "$dir/src/main/resources"
#        echo "Build-Type: SNAPSHOT" > "$dir/src/main/resources/build-info.txt"
#        echo "Iteration: $i" >> "$dir/src/main/resources/build-info.txt"
#        echo "Timestamp: $(date)" >> "$dir/src/main/resources/build-info.txt"
#
#        echo "  -> Pushing $SNAP_VERSION (Build #$i)..."
#        (cd "$dir" && mvn clean deploy -Dproject.version=$SNAP_VERSION -Dmaven.test.skip=true -q -U)
#
#        if [ $? -eq 0 ]; then
#            echo "     ✅ Success: $SNAP_VERSION #$i"
#        else
#            echo "     ❌ Failed to push Snapshot #$i"
#        fi
#    done
#
#    # --- PHASE 2: 10 STABLE RELEASES ---
#    echo "🎯 Phase 2: Uploading 10 RELEASES to Nexus..."
#    for i in {1..10}; do
#        REL_VERSION="1.0.$i"
#
#        echo "Build-Type: RELEASE" > "$dir/src/main/resources/build-info.txt"
#        echo "Version: $REL_VERSION" >> "$dir/src/main/resources/build-info.txt"
#        echo "Timestamp: $(date)" >> "$dir/src/main/resources/build-info.txt"
#
#        echo "  -> Pushing Release $REL_VERSION..."
#        (cd "$dir" && mvn clean deploy -Dproject.version=$REL_VERSION -Dmaven.test.skip=true -q -U)
#
#        if [ $? -eq 0 ]; then
#            echo "     ✅ Success: $REL_VERSION"
#        else
#            echo "     ❌ Failed to push Release $REL_VERSION"
#        fi
#    done
#done
#
#echo "========================================================"
#echo "🎊 FINISHED! All services populated in Nexus!"
#echo "========================================================"