package com.tikal.api.controller;

import com.tikal.api.model.dto.TimeLogDTO;
import com.tikal.api.model.dto.TimeLogRequest;
import com.tikal.api.service.TimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/time_log")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TimeLogController {
    private final TimeLogService timeLogService;

    @GetMapping("/list_by_day")
    public ResponseEntity<List<TimeLogDTO>> getTimeLogByDay(@RequestParam LocalDate day) {
        return ResponseEntity.ok(timeLogService.listByDay(day));
    }

    @PostMapping
    public ResponseEntity<TimeLogDTO> createTimeLog(@RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeLogDTO> updateTimeLog(@PathVariable Integer id, @RequestBody TimeLogRequest request) {
        return ResponseEntity.ok(timeLogService.update(request, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
