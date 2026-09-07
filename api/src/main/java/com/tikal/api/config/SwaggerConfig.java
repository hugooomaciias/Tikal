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
                        .version("1.0")
                        .description("API documentation with Token Authentication")
                        .contact(new Contact().name("Tikal API Team").email("devs@tikal.example"))
                        .license(new License().name("Proprietary").url("https://example.com/license"))
                )
                .servers(List.of(new Server().url("http://localhost:8080").description("Local server")))
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
