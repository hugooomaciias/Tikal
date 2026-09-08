package com.tikal.api.model.dto.task;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    @Schema(description = "ID de la tarea", example = "1")
    private Integer id;

    @Schema(description = "Nombre de la tarea", example = "Implement feature X")
    private String name;

    @Schema(description = "Descripción de la tarea", example = "Descripción detallada")
    private String description;

    @Schema(description = "Tiempo estimado (en la unidad indicada por timeUnit)", example = "120")
    private Integer estimatedTime;

    @Schema(description = "Unidad de tiempo para estimatedTime", example = "m")
    private Character timeUnit;

    @Schema(description = "Indica si la tarea está completada", example = "false")
    private Boolean isCompleted;

    @Schema(description = "Fecha de finalización (ISO instant)", example = "2026-02-01T10:00:00Z")
    private Instant completionDate;

    @Schema(description = "Beneficio estimado", example = "99.99")
    private BigDecimal estimatedProfit;

    @Schema(description = "Fecha límite (ISO instant)", example = "2026-01-31T18:00:00Z")
    private Instant deadline;

    @Schema(description = "Total de minutos registrados en la tarea", example = "90")
    private Integer totalLoggedMinutes;

    @Schema(description = "Minutos registrados en modo temple", example = "30")
    private Integer templeLoggedMinutes;

    @Schema(description = "Cantidad de subtareas", example = "2")
    private Integer subtasksCount;

    @Schema(description = "Color asociado a la tarea (hex)", example = "#FF0000")
    private String colour;

    @Schema(description = "URL del logo/ícono de la tarea", example = "https://.../logo.png")
    private String logo;

    @Schema(description = "Si se añadió al calendario", example = "true")
    private Boolean addToCalendar;

    @Schema(description = "Si la tarea es de tipo grupal", example = "false")
    private Boolean isGroupBased;

    @Schema(description = "Lista de subtareas")
    private List<TaskDTO> subtasks;

    @Schema(description = "Usuarios asignados a la tarea")
    private List<AssignedUser> assignedUsers;

    @Data
    @Builder
    public static class AssignedUser {
        @Schema(description = "ID del usuario asignado", example = "12")
        private Integer id;

        @Schema(description = "Nombre del usuario asignado", example = "María López")
        private String name;

        @Schema(description = "URL del avatar del usuario", example = "https://.../avatar.png")
        private String avatar;
    }
}
