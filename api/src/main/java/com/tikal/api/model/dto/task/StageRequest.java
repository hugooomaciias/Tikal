package com.tikal.api.model.dto.task;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageRequest {
    @Schema(description = "Nombre del stage", example = "Desarrollo")
    private String name;

    @Schema(description = "Descripción del stage", example = "Tareas de desarrollo backend")
    private String description;

    @Schema(description = "Color asociado al stage (hex)", example = "#00FF00")
    private String colour;

    @Schema(description = "Fecha límite del stage (ISO instant)", example = "2026-02-28T23:59:59Z")
    private Instant deadline;

    @Schema(description = "ID del proyecto asociado", example = "5")
    private Integer projectId;

    @Schema(description = "Si el stage debe agregarse al calendario del usuario", example = "false")
    private Boolean addToCalendar;
}
