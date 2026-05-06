package com.tikal.api.controller;


import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.calendar.CalendarEventRequest;
import com.tikal.api.model.dto.calendar.ChangeTimeRequest;
import com.tikal.api.service.CalendarEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        return ResponseEntity.ok(calendarEventService.getEventsBetweenDates(start, end));
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
}
