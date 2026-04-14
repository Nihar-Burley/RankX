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
