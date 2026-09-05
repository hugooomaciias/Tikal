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

@RestController
@RequestMapping("/api/calendar_event")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CalendarEventController {
    private final CalendarEventService calendarEventService;

    // Retrieve events within a date range
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

    // Creates a calendar event
    @PostMapping
    public ResponseEntity<CalendarEventDTO> createEvent(@Valid @RequestBody CalendarEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarEventService.createEvent(request));
    }

    // Update an entire event
    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            @PathVariable Integer id,
            @Valid @RequestBody CalendarEventRequest request) {

        return ResponseEntity.ok(calendarEventService.updateEvent(id, request));
    }

    // Change the time only
    @PatchMapping("/{id}/time")
    public ResponseEntity<CalendarEventDTO> changeEventTime(
            @PathVariable Integer id,
            @Valid @RequestBody ChangeTimeRequest request) {

        return ResponseEntity.ok(calendarEventService.changeEventTime(id, request));
    }

    // Delete event
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        calendarEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/calendar_event/{eventId}/attendees
     * Reassign users to a event (Drag & Drop or Multi-select)
     */
    @PatchMapping("/{eventId}/attendees")
    public ResponseEntity<Void> assignUsersToTask(
            @PathVariable Integer eventId,
            @RequestBody AssignUsersRequest request) {

        calendarEventService.assignAttendees(eventId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
