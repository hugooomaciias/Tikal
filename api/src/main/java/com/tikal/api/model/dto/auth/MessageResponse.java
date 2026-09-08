package com.tikal.api.model.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageResponse {
    @Schema(description = "Mensaje informativo para el cliente", example = "Se ha enviado un código a tu correo")
    private String message;
}
