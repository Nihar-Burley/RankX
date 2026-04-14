#!/bin/bash

# ✅ Configuration - Pointing to your new production URLs
NEXUS_NPM_SNAPSHOT="https://trainwithats.online/nexus/repository/npm-trainwithats-snapshort/"
NEXUS_NPM_RELEASE="https://trainwithats.online/nexus/repository/npm-trainwithats-release/"

# Find frontend directories (Rankx and Rankx-admin)
for dir in frontend/rankx frontend/rankx-admin; do
    if [ -d "$dir" ]; then
        echo "--------------------------------------------------------"
        echo "Processing Frontend: $dir"
        echo "--------------------------------------------------------"

        cd "$dir" || exit

        # 1. Ensure 'private' is removed and cleanup any existing lockfiles for a clean push
        # Using sed compatibility for both Mac (sed -i '') and Linux (sed -i)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/"private": true,//g' package.json
        else
            sed -i 's/"private": true,//g' package.json
        fi

        # 2. Upload 10 SNAPSHOTS (1.0.0-SNAPSHOT.1 to 1.0.0-SNAPSHOT.10)
        echo "🚀 Uploading 10 SNAPSHOT versions to $NEXUS_NPM_SNAPSHOT"
        for i in {1..10}; do
            VERSION="1.0.0-SNAPSHOT.$i"
            npm version "$VERSION" --no-git-tag-version --allow-same-version
            echo "Pushing Snapshot build #$i ($VERSION)..."
            npm publish --registry="$NEXUS_NPM_SNAPSHOT" --quiet
        done

        # 3. Upload 10 RELEASES (1.0.1 to 1.0.10)
        echo "🎯 Uploading 10 RELEASE versions to $NEXUS_NPM_RELEASE"
        for i in {1..10}; do
            VERSION="1.0.$i"
            npm version "$VERSION" --no-git-tag-version --allow-same-version
            echo "Pushing Release build #$i ($VERSION)..."
            npm publish --registry="$NEXUS_NPM_RELEASE" --quiet
        done

        cd ../..
    else
        echo "⚠️ Directory $dir not found. Skipping..."
    fi
done

echo "✅ All NPM artifacts processed successfully!"