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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de tareas", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TaskDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Stage no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/by_stage/{stageId}")
    public ResponseEntity<List<TaskDTO>> getTasksByStage(@Parameter(description = "ID del stage", example = "14", in = ParameterIn.PATH) @PathVariable Integer stageId) {
        return ResponseEntity.ok(taskService.getTasksByStage(stageId));
    }

    /**
     * POST /api/task
     * Create a new task.
     */
    @Operation(summary = "Crear tarea", description = "Crea una nueva tarea.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tarea creada correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TaskDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "409", description = "Conflicto (tarea duplicada)"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para crear la tarea", required = true, content = @Content(schema = @Schema(implementation = TaskRequest.class))) @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    /**
     * DELETE /api/task/{id}
     * Delete a task by id.
     */
    @Operation(summary = "Eliminar tarea", description = "Elimina una tarea por id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tarea eliminada correctamente (sin contenido)"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Acceso prohibido"),
            @ApiResponse(responseCode = "404", description = "Tarea no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@Parameter(description = "ID de la tarea a eliminar", example = "14", in = ParameterIn.PATH) @PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/task/{id}
     * Update an existing task.
     */
    @Operation(summary = "Actualizar tarea", description = "Actualiza una tarea existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tarea actualizada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TaskDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Tarea no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @Parameter(description = "ID de la tarea", example = "14", in = ParameterIn.PATH) @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar de la tarea", required = true, content = @Content(schema = @Schema(implementation = TaskRequest.class))) @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    /**
     * PATCH /api/task/{id}/toggle-status
     * Toggle the completion status of a task.
     */
    @Operation(summary = "Alternar estado de tarea", description = "Alterna el estado de finalización de una tarea.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado alternado correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TaskDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Tarea no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<TaskDTO> toggleTaskStatus(@Parameter(description = "ID de la tarea", example = "14", in = ParameterIn.PATH) @PathVariable("id") Integer id) {
        return ResponseEntity.ok(taskService.toggleTaskStatus(id));
    }

    /**
     * PATCH /api/tasks/{taskId}/assign
     * Reassign users to a task (Drag & Drop or Multi-select)
     */
    @Operation(summary = "Asignar usuarios a tarea", description = "Reasigna usuarios a una tarea (arrastrar y soltar o multi-selección). Recibe una lista de ids de usuario en el body.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuarios asignados correctamente (sin contenido)"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Acceso prohibido"),
            @ApiResponse(responseCode = "404", description = "Tarea o usuario no encontrados"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<Void> assignUsersToTask(
            @Parameter(description = "ID de la tarea", example = "14", in = ParameterIn.PATH) @PathVariable Integer taskId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "IDs de usuarios a asignar", required = true, content = @Content(schema = @Schema(implementation = AssignUsersRequest.class))) @RequestBody AssignUsersRequest request) {

        taskService.assignUsersToTask(taskId, request.getAssignedUserIds());
        return ResponseEntity.noContent().build();
    }
}
