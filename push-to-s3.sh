#!/bin/bash

# Configuration
REGISTRY="trainwithats.online:8082"
VERSION="1.0.0"
SERVICES=(
  "config-server" "discovery-server" "api-gateway"
  "auth-service" "user-service" "submission-service"
  "problem-service" "question-service" "quiz-service"
  "result-service" "attempt-service"
)

# Login to ALB HTTPS port
echo "🔐 Logging into Nexus..."
docker login $REGISTRY -u admin -p admin

for SERVICE in "${SERVICES[@]}"; do
    echo "--------------------------------------------"
    echo "🚀 Building and Pushing: $SERVICE"

    # 1. Build
    docker build -t $SERVICE:$VERSION ./$SERVICE

    # 2. Tag
    docker tag $SERVICE:$VERSION $REGISTRY/$SERVICE:$VERSION

    # 3. Push
    docker push $REGISTRY/$SERVICE:$VERSION
done

echo "🎉 Success! All 11 images are now stored in your S3 bucket."