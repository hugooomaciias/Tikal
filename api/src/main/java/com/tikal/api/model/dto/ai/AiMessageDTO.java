package com.tikal.api.model.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AiMessageDTO {
    @Schema(description = "ID del mensaje", example = "1")
    private Integer id;

    @Schema(description = "Contenido del mensaje", example = "Respuesta del AI: ...")
    private String content;

    @Schema(description = "Rol del autor del mensaje (user/assistant)", example = "assistant")
    private String role;

    @Schema(description = "Fecha de creación (ISO instant)", example = "2026-01-01T12:00:00Z")
    private Instant createdAt;
}
