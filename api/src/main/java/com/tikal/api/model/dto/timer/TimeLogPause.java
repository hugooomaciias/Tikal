package com.tikal.api.model.dto.timer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogPause {
    @Schema(description = "Fecha/hora de fin de la pausa (ISO instant)", example = "2026-01-10T09:30:00Z")
    private Instant endDateTime;

    @Schema(description = "Descripción de la actividad durante la pausa", example = "Breve descanso")
    private String activityDescription;
}
