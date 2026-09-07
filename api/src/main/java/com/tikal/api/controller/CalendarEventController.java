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
    @GetMapping
    public ResponseEntity<List<CalendarEventDTO>> getEventsBetweenDates(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {

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
    @PostMapping
    public ResponseEntity<CalendarEventDTO> createEvent(@Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarEventService.createEvent(request));
    }

    /**
     * PUT /api/calendar_event/{id}
     * Update an entire calendar event.
     */
    @Operation(summary = "Actualizar evento de calendario", description = "Actualiza un evento de calendario completo por id.")
    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            @PathVariable Integer id,
            @Valid @RequestBody CalendarEventRequest request) {

        return ResponseEntity.ok(calendarEventService.updateEvent(id, request));
    }

    /**
     * PATCH /api/calendar_event/{id}/time
     * Change only the time of an existing event.
     */
    @Operation(summary = "Cambiar hora de evento", description = "Cambia únicamente la hora de un evento existente.")
    @PatchMapping("/{id}/time")
    public ResponseEntity<CalendarEventDTO> changeEventTime(
            @PathVariable Integer id,
            @Valid @RequestBody ChangeTimeRequest request) {

        return ResponseEntity.ok(calendarEventService.changeEventTime(id, request));
    }

    /**
     * DELETE /api/calendar_event/{id}
     * Delete a calendar event.
     */
    @Operation(summary = "Eliminar evento de calendario", description = "Elimina un evento de calendario por id.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        calendarEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/calendar_event/{eventId}/attendees
     * Reassign users to a event (Drag & Drop or Multi-select)
     */
    @Operation(summary = "Asignar asistentes", description = "Reasigna usuarios a un evento (arrastrar y soltar o multi-selección). Recibe una lista de ids de usuario en el body.")
    @PatchMapping("/{eventId}/attendees")
    public ResponseEntity<Void> assignUsersToTask(
            @PathVariable Integer eventId,
            @RequestBody AssignUsersRequest request) {

        calendarEventService.assignAttendees(eventId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
