package com.tikal.api.model.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginRequest {
    /* --- This attribute could be the name or the email of the user --- */
    @Schema(description = "Email o nombre de usuario para autenticación", example = "usuario@acme.com")
    private String identifier;

    @Schema(description = "Contraseña del usuario", example = "P@ssw0rd!")
    private String password;
}