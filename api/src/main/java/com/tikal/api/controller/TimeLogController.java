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
    @GetMapping("/list_by_day")
    public ResponseEntity<List<TimeLogDTO>> getTimeLogByDay(@RequestParam LocalDate day) {
        return ResponseEntity.ok(timeLogService.listByDay(day));
    }

    /**
     * GET /api/time_log/active
     * Returns the currently active timer for the authenticated user.
     */
    @Operation(summary = "Obtener temporizador activo", description = "Devuelve el temporizador activo actualmente para el usuario autenticado.")
    @GetMapping("/active")
    public ResponseEntity<ActiveTimerDTO> getActiveTime() {
        return ResponseEntity.ok(timeLogService.getActiveTimeLog());
    }

    /**
     * POST /api/time_log
     * Create a new time log entry.
     */
    @Operation(summary = "Crear registro de tiempo", description = "Crea una nueva entrada de registro de tiempo.")
    @PostMapping
    public ResponseEntity<TimeLogDTO> createTimeLog(@RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.create(request));
    }

    /**
     * POST /api/time_log/start
     * Start a new timer (creates and starts a time log).
     */
    @Operation(summary = "Iniciar temporizador", description = "Inicia un nuevo temporizador (crea y arranca un registro de tiempo).")
    @PostMapping("/start")
    public ResponseEntity<TimeLogDTO> startTimer(@RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.start(request));
    }

    /**
     * PUT /api/time_log/{id}
     * Update an existing time log.
     */
    @Operation(summary = "Actualizar registro de tiempo", description = "Actualiza un registro de tiempo existente.")
    @PutMapping("/{id}")
    public ResponseEntity<TimeLogDTO> updateTimeLog(@PathVariable Integer id, @RequestBody TimeLogRequest request) {
        return ResponseEntity.ok(timeLogService.update(request, id));
    }

    /**
     * PATCH /api/time_log/{id}/pause
     * Pause a running time log.
     */
    @Operation(summary = "Pausar temporizador", description = "Pausa un registro de tiempo en ejecución.")
    @PatchMapping("/{id}/pause")
    public ResponseEntity<TimeLogDTO> pauseTimer(@PathVariable Integer id, @RequestBody TimeLogPause request) {
        return ResponseEntity.ok(timeLogService.pause(request, id));
    }

    /**
     * PATCH /api/time_log/stop
     * Stop a batch of running timers.
     */
    @Operation(summary = "Detener lote de temporizadores", description = "Detiene un lote de temporizadores en ejecución.")
    @PatchMapping("/stop")
    public ResponseEntity<List<TimeLogDTO>> pauseTimer(@RequestBody TimeLogBatchRequest request) {
        return ResponseEntity.ok(timeLogService.stop(request));
    }

    /**
     * DELETE /api/time_log/{id}
     * Delete a time log entry.
     */
    @Operation(summary = "Eliminar registro de tiempo", description = "Elimina una entrada de registro de tiempo.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
