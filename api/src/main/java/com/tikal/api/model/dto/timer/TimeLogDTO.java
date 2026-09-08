package com.tikal.api.model.dto.timer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogDTO {
    @Schema(description = "ID del registro de tiempo", example = "12")
    private Integer id;

    @Schema(description = "Fecha/hora de inicio (ISO instant)", example = "2026-01-10T09:00:00Z")
    private Instant initDateTime;

    @Schema(description = "Fecha/hora de fin (ISO instant)", example = "2026-01-10T10:00:00Z")
    private Instant endDateTime;

    @Schema(description = "ID del proyecto asociado", example = "5")
    private Integer projectId;

    @Schema(description = "ID del stage asociado", example = "3")
    private Integer stageId;

    @Schema(description = "ID de la tarea asociada", example = "9")
    private Integer taskId;

    @Schema(description = "Duración en minutos registrada", example = "60")
    private Integer minutes;

    @Schema(description = "URL del logo del proyecto", example = "https://.../logo.png")
    private String logo;

    @Schema(description = "Color asociado al registro", example = "#0000FF")
    private String color;

    @Schema(description = "Nombre de la tarea relacionada", example = "Fix login bug")
    private String taskName;

    @Schema(description = "Descripción de la actividad", example = "Programación y pruebas")
    private String activityDescription;
}
