package com.tikal.api.controller;


import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.calendar.CalendarEventRequest;
import com.tikal.api.model.dto.calendar.ChangeTimeRequest;
import com.tikal.api.model.dto.task.AssignUsersRequest;
import com.tikal.api.service.CalendarEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/calendar_event")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Calendar Events", description = "Operaciones para gestionar eventos de calendario")
@SecurityRequirement(name = "bearerAuth")
public class CalendarEventController {
    private final CalendarEventService calendarEventService;

    /**
     * GET /api/calendar_event
     * Retrieve events within a date range (optional start/end). Defaults to current month if not provided.
     */
    @Operation(summary = "Obtener eventos por rango de fecha", description = "Devuelve los eventos dentro de un rango de fechas. Si no se proporcionan start/end, se usa el mes actual por defecto.")
    @ApiResponse(responseCode = "200", description = "Listado de eventos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CalendarEventDTO.class)))
    @GetMapping
    public ResponseEntity<List<CalendarEventDTO>> getEventsBetweenDates(
            @Parameter(in = ParameterIn.QUERY, description = "Fecha/hora de inicio (ISO instant). Ej: 2026-01-01T00:00:00Z", example = "2026-01-01T00:00:00Z") @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @Parameter(in = ParameterIn.QUERY, description = "Fecha/hora de fin (ISO instant). Ej: 2026-01-31T23:59:59Z", example = "2026-01-31T23:59:59Z") @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {

        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // If start isn't send 'start', by default is going to be the first day of the month
        Instant actualStart = (start != null) ? start
                : today.withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        // If start isn't send 'start', by default is going to be the last day of the month
        Instant actualEnd = (end != null) ? end
                : today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        return ResponseEntity.ok(calendarEventService.getEventsBetweenDates(actualStart, actualEnd));
    }

    /**
     * POST /api/calendar_event
     * Creates a new calendar event.
     */
    @Operation(summary = "Crear evento de calendario", description = "Crea un nuevo evento de calendario.")
    @ApiResponse(responseCode = "201", description = "Evento creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CalendarEventDTO.class)))
    @PostMapping
    public ResponseEntity<CalendarEventDTO> createEvent(@Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del evento a crear", required = true, content = @Content(schema = @Schema(implementation = CalendarEventRequest.class))) @RequestBody CalendarEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarEventService.createEvent(request));
    }

    /**
     * PUT /api/calendar_event/{id}
     * Update an entire calendar event.
     */
    @Operation(summary = "Actualizar evento de calendario", description = "Actualiza un evento de calendario completo por id.")
    @ApiResponse(responseCode = "200", description = "Evento actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CalendarEventDTO.class)))
    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            @Parameter(description = "ID del evento", example = "14", in = ParameterIn.PATH) @PathVariable Integer id,
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos completos del evento", required = true, content = @Content(schema = @Schema(implementation = CalendarEventRequest.class))) @RequestBody CalendarEventRequest request) {

        return ResponseEntity.ok(calendarEventService.updateEvent(id, request));
    }

    /**
     * PATCH /api/calendar_event/{id}/time
     * Change only the time of an existing event.
     */
    @Operation(summary = "Cambiar hora de evento", description = "Cambia únicamente la hora de un evento existente.")
    @ApiResponse(responseCode = "200", description = "Hora cambiada correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CalendarEventDTO.class)))
    @PatchMapping("/{id}/time")
    public ResponseEntity<CalendarEventDTO> changeEventTime(
            @Parameter(description = "ID del evento", example = "14", in = ParameterIn.PATH) @PathVariable Integer id,
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevo rango/hora del evento", required = true, content = @Content(schema = @Schema(implementation = ChangeTimeRequest.class))) @RequestBody ChangeTimeRequest request) {

        return ResponseEntity.ok(calendarEventService.changeEventTime(id, request));
    }

    /**
     * DELETE /api/calendar_event/{id}
     * Delete a calendar event.
     */
    @Operation(summary = "Eliminar evento de calendario", description = "Elimina un evento de calendario por id.")
    @ApiResponse(responseCode = "204", description = "Evento eliminado (sin contenido)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@Parameter(description = "ID del evento a eliminar", example = "14", in = ParameterIn.PATH) @PathVariable Integer id) {
        calendarEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/calendar_event/{eventId}/attendees
     * Reassign users to a event (Drag & Drop or Multi-select)
     */
    @Operation(summary = "Asignar asistentes", description = "Reasigna usuarios a un evento (arrastrar y soltar o multi-selección). Recibe una lista de ids de usuario en el body.")
    @ApiResponse(responseCode = "204", description = "Asistentes asignados correctamente (sin contenido)")
    @PatchMapping("/{eventId}/attendees")
    public ResponseEntity<Void> assignUsersToTask(
            @Parameter(description = "ID del evento", example = "14", in = ParameterIn.PATH) @PathVariable Integer eventId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "IDs de usuarios a asignar como asistentes", required = true, content = @Content(schema = @Schema(implementation = AssignUsersRequest.class))) @RequestBody AssignUsersRequest request) {

        calendarEventService.assignAttendees(eventId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
