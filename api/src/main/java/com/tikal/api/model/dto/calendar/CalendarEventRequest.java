package com.tikal.api.model.dto.calendar;

import com.tikal.api.model.entity.enumerated.EventType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class CalendarEventRequest {

    @NotBlank
    @Schema(description = "Nombre del evento", example = "Reunión de planificación")
    private String name;

    @Schema(description = "Descripción del evento", example = "Definir objetivos del sprint")
    private String description;

    @NotNull
    @Schema(description = "Fecha y hora de inicio (ISO instant)", example = "2026-01-15T09:00:00Z")
    private Instant initDateTime;

    @NotNull
    @Schema(description = "Fecha y hora de fin (ISO instant)", example = "2026-01-15T10:00:00Z")
    private Instant endDateTime;

    @Schema(description = "Si el tracker de tiempo se activa automáticamente para este evento", example = "true")
    private Boolean isActivateTracker;

    @Schema(description = "Color asociado al evento (hex)", example = "#00FF00")
    private String colour;

    @NotNull
    @Schema(description = "Tipo de evento", example = "WORK_SESSION", allowableValues = {"GENERAL","WORK_SESSION","DEADLINE"})
    private EventType eventType;

    @Schema(description = "Indica si el evento ocupa todo el día", example = "false")
    private Boolean isCompleteDay;

    @Schema(description = "IDs de asistentes al evento", example = "[12,34]")
    private List<Integer> attendeeIds;

    // Relations (Opcional)
    @Schema(description = "ID del proyecto asociado (opcional)", example = "5")
    private Integer projectId;

    @Schema(description = "ID del stage asociado (opcional)", example = "3")
    private Integer stageId;

    @Schema(description = "ID de la tarea asociada (opcional)", example = "9")
    private Integer taskId;
}
