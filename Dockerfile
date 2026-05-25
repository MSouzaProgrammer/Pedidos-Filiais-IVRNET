# Usa uma imagem oficial do Java 21 (que é a versão do seu pom.xml)
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copia o jar gerado na pasta target para dentro do container
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]