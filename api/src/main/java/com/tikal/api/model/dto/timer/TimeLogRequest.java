package com.tikal.api.model.dto.timer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogRequest {
    @Schema(description = "Inicio del registro (ISO instant)", example = "2026-01-10T09:00:00Z")
    private Instant initDateTime;

    @Schema(description = "Fin del registro (ISO instant)", example = "2026-01-10T10:00:00Z")
    private Instant endDateTime;

    @Schema(description = "Descripción de la actividad registrada", example = "Desarrollo de API")
    private String activityDescription;

    @Schema(description = "Marca si el registro está completo", example = "true")
    private Boolean isCompleted;

    @Schema(description = "ID del proyecto asociado", example = "5")
    private Integer projectId;

    @Schema(description = "ID del stage asociado", example = "3")
    private Integer stageId;

    @Schema(description = "ID de la tarea asociada", example = "9")
    private Integer taskId;

    @Schema(description = "Tiempo objetivo en minutos para esta sesión", example = "25")
    private Integer targetTime;

    @Schema(description = "Indica si la sesión se ejecutó en modo Temple", example = "false")
    private Boolean isTempleMode;
}
