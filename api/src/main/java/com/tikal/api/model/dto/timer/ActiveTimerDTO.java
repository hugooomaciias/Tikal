package com.tikal.api.model.dto.timer;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ActiveTimerDTO {
    @Schema(description = "ID del TimeLog en ejecución (null si no hay ninguno)", example = "12")
    private Integer id;             // ID of the TimeLog if is running (null if is stopped or pauser)

    @Schema(description = "Color del stage asociado", example = "#FF8800")
    private String colour;           // Stage color

    @Schema(description = "Logo del proyecto asociado", example = "https://.../logo.png")
    private String logo;            // Project logo

    @Schema(description = "Fecha/hora de inicio del temporizador (ISO instant)", example = "2026-01-10T09:00:00Z")
    private Instant initDateTime; // Initial time, null if is stopped

    @Schema(description = "Segundos acumulados entre pausas", example = "120")
    private Long accumulatedSeconds;     // Accumulated seconds in the latest pauses

    @Schema(description = "Nombre de la entidad asociada (tarea/stage/proyecto)", example = "Fix login bug")
    private String entityName;      // Task/Stage/Proyect name
}
