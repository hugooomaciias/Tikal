 package com.tikal.api.model.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegisterRequest {

    @Schema(description = "Nombre completo del usuario", example = "Fernando Pérez")
    private String name;

    @Schema(description = "Email del usuario (debe ser válido)", example = "fernando@example.com")
    private String email;

    @Schema(description = "Contraseña del usuario. Debe cumplir las políticas de seguridad (mín. 8 caracteres, incluir números y símbolos).", example = "P@ssw0rd!")
    private String password;

    @Schema(description = "Zona horaria IANA del usuario", example = "America/Argentina/Buenos_Aires")
    private String timeZone;

    @Schema(description = "Código de idioma preferido", example = "es")
    private String language;

    @Schema(description = "Plan de suscripción", example = "GRATUITO", allowableValues = {"GRATUITO","COMUNITARIO"})
    private String subscriptionPlan;
}
