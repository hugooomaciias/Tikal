package com.tikal.api.model.dto.timer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogBatchRequest {
    @Schema(description = "ID del TimeLog a detener", example = "12")
    private Integer id;

    @Schema(description = "Tiempo de finalización a aplicar (ISO instant)", example = "2026-01-10T10:00:00Z")
    private Instant endDateTime;

    @Schema(description = "Descripción de la actividad al detener", example = "Trabajo finalizado")
    private String activityDescription;
}
