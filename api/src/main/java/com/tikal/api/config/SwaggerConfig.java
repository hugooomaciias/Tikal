package com.tikal.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Tikal API Documentation")
                        .version("1.0.2")
                        .description("API REST para Tikal: Plataforma integral de gestión de tareas, control de tiempo (Modo Templo), gamificación, trabajo en equipo y asistencia por IA.")
                        .contact(new Contact()
                                .name("Tikal Soporte")
                                .email("tikal.soporte@gmail.com"))
                        .license(new License()
                                .name("Tikal - Todos los derechos reservados")
                        )
                )
                .servers(List.of(
                        new Server().url("https://astonishing-respect-production-7028.up.railway.app").description("Servidor de Producción (Railway)"),
                        new Server().url("http://localhost:8080").description("Servidor Local (Desarrollo)")
                ))
                // Define the Security Scheme (Bearer Token) in components. Security requirements
                // will be applied selectively via @SecurityRequirement on controllers or operations.
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
