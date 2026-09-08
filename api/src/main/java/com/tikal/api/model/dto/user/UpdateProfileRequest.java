package com.tikal.api.model.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Schema(description = "Nombre completo del usuario", example = "Fernando Pérez")
    private String name;

    @Schema(description = "Email del usuario", example = "fernando@example.com")
    private String email;

    @Schema(description = "Marca si completó el tutorial de Tikal", example = "false")
    private Boolean tikalTutorialCompleted;
}
