package com.tikal.api.controller;

import com.tikal.api.model.dto.timer.ActiveTimerDTO;
import com.tikal.api.model.dto.timer.TimeLogBatchRequest;
import com.tikal.api.model.dto.timer.TimeLogDTO;
import com.tikal.api.model.dto.timer.TimeLogPause;
import com.tikal.api.model.dto.timer.TimeLogRequest;
import com.tikal.api.service.TimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/time_log")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Time Logs", description = "Operaciones relacionadas con registros de tiempo y temporizadores")
@SecurityRequirement(name = "bearerAuth")
public class TimeLogController {
    private final TimeLogService timeLogService;

    /**
     * GET /api/time_log/list_by_day
     * Returns time logs for a specific day.
     */
    @Operation(summary = "Obtener registros por día", description = "Devuelve los registros de tiempo para un día específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de registros para el día", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Fecha inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/list_by_day")
    public ResponseEntity<List<TimeLogDTO>> getTimeLogByDay(@Parameter(description = "Día a consultar (YYYY-MM-DD)", example = "2026-01-10", in = ParameterIn.QUERY) @RequestParam LocalDate day) {
        return ResponseEntity.ok(timeLogService.listByDay(day));
    }

    /**
     * GET /api/time_log/active
     * Returns the currently active timer for the authenticated user.
     */
    @Operation(summary = "Obtener temporizador activo", description = "Devuelve el temporizador activo actualmente para el usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Temporizador activo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ActiveTimerDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/active")
    public ResponseEntity<ActiveTimerDTO> getActiveTime() {
        return ResponseEntity.ok(timeLogService.getActiveTimeLog());
    }

    /**
     * POST /api/time_log
     * Create a new time log entry.
     */
    @Operation(summary = "Crear registro de tiempo", description = "Crea una nueva entrada de registro de tiempo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registro creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "409", description = "Conflicto (registro duplicado o temporizador activo)") ,
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping
    public ResponseEntity<TimeLogDTO> createTimeLog(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del registro de tiempo a crear", required = true, content = @Content(schema = @Schema(implementation = TimeLogRequest.class))) @RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.create(request));
    }

    /**
     * POST /api/time_log/start
     * Start a new timer (creates and starts a time log).
     */
    @Operation(summary = "Iniciar temporizador", description = "Inicia un nuevo temporizador (crea y arranca un registro de tiempo).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Temporizador iniciado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "409", description = "Conflicto (ya existe un temporizador en ejecución)"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/start")
    public ResponseEntity<TimeLogDTO> startTimer(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para iniciar el temporizador", required = true, content = @Content(schema = @Schema(implementation = TimeLogRequest.class))) @RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.start(request));
    }

    /**
     * PUT /api/time_log/{id}
     * Update an existing time log.
     */
    @Operation(summary = "Actualizar registro de tiempo", description = "Actualiza un registro de tiempo existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Registro no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TimeLogDTO> updateTimeLog(@Parameter(description = "ID del registro", example = "12", in = ParameterIn.PATH) @PathVariable Integer id, @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevos datos del registro", required = true, content = @Content(schema = @Schema(implementation = TimeLogRequest.class))) @RequestBody TimeLogRequest request) {
        return ResponseEntity.ok(timeLogService.update(request, id));
    }

    /**
     * PATCH /api/time_log/{id}/pause
     * Pause a running time log.
     */
    @Operation(summary = "Pausar temporizador", description = "Pausa un registro de tiempo en ejecución.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Temporizador pausado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Registro no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{id}/pause")
    public ResponseEntity<TimeLogDTO> pauseTimer(@Parameter(description = "ID del registro a pausar", example = "12", in = ParameterIn.PATH) @PathVariable Integer id, @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la pausa", required = true, content = @Content(schema = @Schema(implementation = TimeLogPause.class))) @RequestBody TimeLogPause request) {
        return ResponseEntity.ok(timeLogService.pause(request, id));
    }

    /**
     * PATCH /api/time_log/stop
     * Stop a batch of running timers.
     */
    @Operation(summary = "Detener lote de temporizadores", description = "Detiene un lote de temporizadores en ejecución.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Temporizadores detenidos y devueltos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TimeLogDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "409", description = "Conflicto al detener temporizadores"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/stop")
    public ResponseEntity<List<TimeLogDTO>> pauseTimer(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Lista de temporizadores a detener (id, endDateTime opcional)", required = true, content = @Content(schema = @Schema(implementation = TimeLogBatchRequest.class))) @RequestBody TimeLogBatchRequest request) {
        return ResponseEntity.ok(timeLogService.stop(request));
    }

    /**
     * DELETE /api/time_log/{id}
     * Delete a time log entry.
     */
    @Operation(summary = "Eliminar registro de tiempo", description = "Elimina una entrada de registro de tiempo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Registro eliminado correctamente (sin contenido)"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Registro no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@Parameter(description = "ID del registro a eliminar", example = "12", in = ParameterIn.PATH) @PathVariable Integer id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
