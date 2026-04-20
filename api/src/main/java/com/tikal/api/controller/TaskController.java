package com.tikal.api.controller;

import com.tikal.api.model.dto.task.CreateTaskRequest;
import com.tikal.api.model.dto.task.TaskDTO;
import com.tikal.api.model.dto.task.UpdateTaskRequest;
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

    @GetMapping("/subtask/{parentId}")
    public ResponseEntity<List<TaskDTO>> getSubtask(@PathVariable Integer parentId) {
        return ResponseEntity.ok(taskService.getSubtask(parentId));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody CreateTaskRequest request) {
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
            @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }
}
