package com.tikal.api.controller;

import com.tikal.api.model.dto.task.AssignUsersRequest;
import com.tikal.api.model.dto.task.TaskRequest;
import com.tikal.api.model.dto.task.TaskDTO;
import com.tikal.api.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @GetMapping("/by_stage/{stageId}")
    public ResponseEntity<List<TaskDTO>> getTasksByStage(@PathVariable Integer stageId) {
        return ResponseEntity.ok(taskService.getTasksByStage(stageId));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Integer id,
            @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<TaskDTO> toggleTaskStatus(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(taskService.toggleTaskStatus(id));
    }

    /**
     * PATCH /api/tasks/{taskId}/assign
     * Reassign users to a task (Drag & Drop or Multi-select)
     */
    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<Void> assignUsersToTask(
            @PathVariable Integer taskId,
            @RequestBody AssignUsersRequest request) {

        taskService.assignUsersToTask(taskId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
