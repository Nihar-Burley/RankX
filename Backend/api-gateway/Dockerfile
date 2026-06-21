FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY Backend/api-gateway/pom.xml ./pom.xml
COPY Backend/api-gateway/src ./src

RUN mvn -B -DskipTests package && \
    cp "$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*original*.jar' | head -n 1)" /tmp/app.jar

FROM eclipse-temurin:21-jre-jammy

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    useradd --create-home --shell /usr/sbin/nologin appuser

WORKDIR /app
COPY --from=build /tmp/app.jar /app/app.jar

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=6 CMD curl -fsS http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
