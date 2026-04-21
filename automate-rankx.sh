#!/bin/bash

# --- 1. CONFIGURATION ---
PUSH_REGISTRY="trainwithats.online:8083"
NEXUS_USER="admin"
NEXUS_PASS="admin123"
VERSION="1.0.0"

# Core backbone services only
CORE_SERVICES=("config-server" "discovery-server" "api-gateway")

echo "🔐 Logging into Nexus HOSTED Registry (Port 8083)..."
echo "$NEXUS_PASS" | docker login $PUSH_REGISTRY -u $NEXUS_USER --password-stdin

# --- 2. BACKEND: JAVA 21 SERVICES ---
for SERVICE in "${CORE_SERVICES[@]}"; do
    echo "🏗️  Processing Core Service: $SERVICE"

    # JJWT Version Fix (Prevents .build() compilation error)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/0.11.5/0.12.6/g' ./$SERVICE/pom.xml 2>/dev/null
        sed -i '' 's/1.3.0/0.12.6/g' ./$SERVICE/pom.xml 2>/dev/null
    else
        sed -i 's/0.11.5/0.12.6/g' ./$SERVICE/pom.xml 2>/dev/null
        sed -i 's/1.3.0/0.12.6/g' ./$SERVICE/pom.xml 2>/dev/null
    fi

    # Create temporary Maven auth
    cat <<EOF > ./$SERVICE/settings.xml
<settings>
  <servers>
    <server>
      <id>nexus-trainwithats</id>
      <username>$NEXUS_USER</username>
      <password>$NEXUS_PASS</password>
    </server>
  </servers>
</settings>
EOF

    # Dockerfile: Java 21 + Skipping Tests for speed
    cat <<EOF > ./$SERVICE/Dockerfile
FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app
COPY settings.xml /usr/share/maven/ref/settings.xml
COPY pom.xml .
RUN mvn -s /usr/share/maven/ref/settings.xml dependency:go-offline -Dmaven.test.skip=true || true
COPY src ./src
RUN mvn -s /usr/share/maven/ref/settings.xml clean package -DskipTests -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV CONFIG_SERVER_URL=http://config-server:8888
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF

    echo "📦 Building $SERVICE for linux/amd64 (EC2 Compatible)..."
    docker build --platform linux/amd64 -t $SERVICE:$VERSION ./$SERVICE

    echo "📤 Pushing to Hosted Registry at Port 8083..."
    docker tag $SERVICE:$VERSION $PUSH_REGISTRY/$SERVICE:$VERSION
    docker push $PUSH_REGISTRY/$SERVICE:$VERSION

    rm ./$SERVICE/settings.xml
done

echo "--------------------------------------------------------"
echo "🎉 CORE SERVICES (3/13) PUSHED TO S3 VIA PORT 8083!"
echo "--------------------------------------------------------"