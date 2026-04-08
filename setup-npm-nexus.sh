#!/bin/bash

# Configuration
NEXUS_NPM_HOSTED="https://prelive.trainwithats.online/nexus/repository/npm-trainwithats-hosted/"

# Find frontend directories (Rankx and Rankx-admin)
for dir in frontend/Rankx frontend/Rankx-admin; do
    if [ -d "$dir" ]; then
        echo "--------------------------------------------------------"
        echo "Processing Frontend: $dir"
        echo "--------------------------------------------------------"

        cd "$dir" || exit

        # 1. Ensure 'private' is removed so we can publish
        sed -i '' 's/"private": true,//g' package.json

        # 2. Upload 10 SNAPSHOTS
        echo "Uploading 10 SNAPSHOT versions..."
        for i in {1..10}; do
            # Set version with a unique build suffix for snapshots
            npm version 0.0.1-SNAPSHOT.$i --no-git-tag-version --allow-same-version
            echo "Pushing Snapshot build #$i..."
            npm publish --registry=$NEXUS_NPM_HOSTED --quiet
        done

        # 3. Upload 10 RELEASES
        echo "Uploading 10 RELEASE versions..."
        for i in {1..10}; do
            # Set unique release versions (0.0.1, 0.0.2, etc.)
            npm version 0.0.$i --no-git-tag-version --allow-same-version
            echo "Pushing Release build #$i..."
            npm publish --registry=$NEXUS_NPM_HOSTED --quiet
        done

        cd ../..
    fi
done

echo "NPM projects processed!"