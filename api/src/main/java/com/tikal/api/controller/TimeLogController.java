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

    @GetMapping("/active")
    public ResponseEntity<ActiveTimerDTO> getActiveTime() {
        return ResponseEntity.ok(timeLogService.getActiveTimeLog());
    }

    @PostMapping
    public ResponseEntity<TimeLogDTO> createTimeLog(@RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.create(request));
    }

    @PostMapping("/start")
    public ResponseEntity<TimeLogDTO> startTimer(@RequestBody TimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeLogService.start(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeLogDTO> updateTimeLog(@PathVariable Integer id, @RequestBody TimeLogRequest request) {
        return ResponseEntity.ok(timeLogService.update(request, id));
    }

    @PatchMapping("/{id}/pause")
    public ResponseEntity<TimeLogDTO> pauseTimer(@PathVariable Integer id, @RequestBody TimeLogPause request) {
        return ResponseEntity.ok(timeLogService.pause(request, id));
    }

    @PatchMapping("/stop")
    public ResponseEntity<List<TimeLogDTO>> pauseTimer(@RequestBody TimeLogBatchRequest request) {
        return ResponseEntity.ok(timeLogService.stop(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        timeLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
