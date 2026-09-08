package com.tikal.api.model.dto.task;

import com.tikal.api.model.entity.enumerated.ProjectType;
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
public class StageDTO {
    @Schema(description = "ID del stage", example = "3")
    private Integer id;

    @Schema(description = "Nombre del stage", example = "Desarrollo")
    private String name;

    @Schema(description = "Descripción del stage", example = "Tareas de desarrollo backend")
    private String description;

    @Schema(description = "Color del stage (hex)", example = "#00FF00")
    private String colour;

    @Schema(description = "Fecha límite del stage (ISO instant)", example = "2026-02-28T23:59:59Z")
    private Instant deadline;

    @Schema(description = "Total de minutos registrados en el stage", example = "300")
    private Integer totalLoggedMinutes;

    @Schema(description = "Minutos registrados en modo temple", example = "60")
    private Integer templeLoggedMinutes;

    @Schema(description = "URL del logo del stage", example = "https://.../logo.png")
    private String logo;

    @Schema(description = "Si se agregó al calendario", example = "false")
    private Boolean addToCalendar;

    @Schema(description = "Tipo de proyecto asociado al stage", example = "KANBAN")
    private ProjectType type;
}
