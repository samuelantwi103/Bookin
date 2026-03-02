package com.book.in.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public OpenAPI bookInApi() {
        // Split CORS origins to get the first one as the main server URL
        String[] origins = allowedOrigins.split(",");
        String frontendUrl = origins.length > 0 ? origins[0].trim() : "http://localhost:3000";

        Server localServer = new Server()
                .url("http://localhost:8080")
                .description("Local Development Server");

        Server frontendServer = new Server()
                .url(frontendUrl)
                .description("Frontend Application");

        Contact contact = new Contact()
                .name("BookIn Support")
                .email("support@bookin.ug.edu.gh")
                .url("https://bookin.ug.edu.gh");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("BookIn API - University of Ghana Facility Booking System")
                .version("1.0.0")
                .description("RESTful API for booking and managing university facilities including " +
                        "lecture halls, seminar rooms, laboratories, and meeting spaces across the " +
                        "University of Ghana campus. Supports user authentication, real-time availability " +
                        "checking, booking management, and administrative controls.")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, frontendServer));
    }
}
