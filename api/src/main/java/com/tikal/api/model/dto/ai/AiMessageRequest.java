package com.tikal.api.model.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class AiMessageRequest {
    @Schema(description = "Contenido del mensaje enviado al AI", example = "Ayúdame a priorizar mis tareas para hoy")
    private String content;
}
