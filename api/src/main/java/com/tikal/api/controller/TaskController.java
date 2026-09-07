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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/task")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Operaciones para gestionar tareas")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
    private final TaskService taskService;

    /**
     * GET /api/task/by_stage/{stageId}
     * Returns tasks that belong to a specific stage.
     */
    @Operation(summary = "Obtener tareas por stage", description = "Devuelve las tareas que pertenecen a un stage específico.")
    @GetMapping("/by_stage/{stageId}")
    public ResponseEntity<List<TaskDTO>> getTasksByStage(@PathVariable Integer stageId) {
        return ResponseEntity.ok(taskService.getTasksByStage(stageId));
    }

    /**
     * POST /api/task
     * Create a new task.
     */
    @Operation(summary = "Crear tarea", description = "Crea una nueva tarea.")
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    /**
     * DELETE /api/task/{id}
     * Delete a task by id.
     */
    @Operation(summary = "Eliminar tarea", description = "Elimina una tarea por id.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/task/{id}
     * Update an existing task.
     */
    @Operation(summary = "Actualizar tarea", description = "Actualiza una tarea existente.")
    @PatchMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Integer id,
            @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    /**
     * PATCH /api/task/{id}/toggle-status
     * Toggle the completion status of a task.
     */
    @Operation(summary = "Alternar estado de tarea", description = "Alterna el estado de finalización de una tarea.")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<TaskDTO> toggleTaskStatus(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(taskService.toggleTaskStatus(id));
    }

    /**
     * PATCH /api/tasks/{taskId}/assign
     * Reassign users to a task (Drag & Drop or Multi-select)
     */
    @Operation(summary = "Asignar usuarios a tarea", description = "Reasigna usuarios a una tarea (arrastrar y soltar o multi-selección). Recibe una lista de ids de usuario en el body.")
    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<Void> assignUsersToTask(
            @PathVariable Integer taskId,
            @RequestBody AssignUsersRequest request) {

        taskService.assignUsersToTask(taskId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
