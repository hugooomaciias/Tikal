package com.tikal.api.model.dto.task;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TaskRequest {
    @NotBlank
    @Schema(description = "Nombre de la tarea", example = "Fix login bug")
    private String name;

    @Schema(description = "Descripción detallada de la tarea", example = "Corregir validación del login cuando el email contiene mayúsculas")
    private String description;

    @Schema(description = "Tiempo estimado (unidad dependiente de timeUnit)", example = "60")
    private Integer estimatedTime;

    @Schema(description = "Unidad de tiempo para estimatedTime (p. ej. 'm' para minutos, 'h' para horas)", example = "m")
    private Character timeUnit;

    @Schema(description = "Beneficio estimado asociado a la tarea", example = "125.50")
    private BigDecimal estimatedProfit;

    @Schema(description = "Fecha límite de la tarea (ISO instant)", example = "2026-01-31T18:00:00Z")
    private Instant deadline;

    @Schema(description = "Indica si la tarea debe agregarse al calendario del usuario", example = "true")
    private Boolean addToCalendar;

    @NotNull
    @Schema(description = "ID del stage al que pertenece la tarea", example = "5")
    private Integer stageId;

    @Schema(description = "Lista de IDs de usuarios asignados a la tarea", example = "[12, 34]")
    private List<Integer> assignedUserIds;

    @Schema(description = "Lista de subtareas (opcional)")
    private List<SubtaskRequest> subtasks;

    @Data
    @Builder
    public static class SubtaskRequest {
        @Schema(description = "ID de la subtarea (si existe)", example = "3")
        private Integer id;

        @NotBlank
        @Schema(description = "Nombre de la subtarea", example = "Revisar logs")
        private String name;
    }
}
