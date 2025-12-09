# Usamos una imagen con Java 23 (según tu proyecto)
FROM eclipse-temurin:23-jdk AS build

WORKDIR /app

# Copiamos solo el pom y descargamos dependencias
COPY pom.xml .
RUN mvn -q -B dependency:resolve

# Copiamos el código y construimos el proyecto
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# Runtime
FROM eclipse-temurin:23-jre

WORKDIR /app

# Copiamos el jar construido
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
