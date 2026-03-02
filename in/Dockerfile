# ─── Stage 1: Build ───
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom first (cache dependencies)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Make wrapper executable & download dependencies
RUN chmod +x mvnw && ./mvnw dependency:resolve -B -q

# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests -B -q

# ─── Stage 2: Run ───
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

# Database connection is configured via environment variables:
#   DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
# These must be set at runtime (e.g. via cloud provider dashboard,
# docker run -e flags, or a .env file with --env-file).

ENTRYPOINT ["java", "-jar", "app.jar"]
