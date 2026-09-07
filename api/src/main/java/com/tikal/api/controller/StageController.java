package com.tikal.api.controller;

import com.tikal.api.model.dto.task.StageRequest;
import com.tikal.api.model.dto.task.StageDTO;
import com.tikal.api.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/stage")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Stages", description = "Operaciones para gestionar stages de proyectos")
@SecurityRequirement(name = "bearerAuth")
public class StageController {
    private final StageService stageService;

    /**
     * GET /api/stage
     * Returns stages belonging to the authenticated user.
     */
    @Operation(summary = "Obtener mis stages", description = "Devuelve los stages pertenecientes al usuario autenticado.")
    @GetMapping
    public ResponseEntity<List<StageDTO>> getMyStages() {
        return ResponseEntity.ok(stageService.getMyStages());
    }

    /**
     * GET /api/stage/by_project/{id}
     * Returns stages that belong to a specific project.
     */
    @Operation(summary = "Obtener stages por proyecto", description = "Devuelve los stages que pertenecen a un proyecto específico.")
    @GetMapping("/by_project/{id}")
    public ResponseEntity<List<StageDTO>> getStagesByProject(@PathVariable("id") Integer projectId) {
        return ResponseEntity.ok(stageService.getStagesByProject(projectId));
    }

    /**
     * POST /api/stage
     * Create a new stage.
     */
    @Operation(summary = "Crear stage", description = "Crea un nuevo stage.")
    @PostMapping
    public ResponseEntity<StageDTO> createStage(@RequestBody StageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stageService.createStage(request));
    }

    /**
     * DELETE /api/stage/{id}
     * Delete a stage by id.
     */
    @Operation(summary = "Eliminar stage", description = "Elimina un stage por id.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStage(@PathVariable("id") Integer id) {
        stageService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/stage/{id}
     * Update an existing stage.
     */
    @Operation(summary = "Actualizar stage", description = "Actualiza un stage existente.")
    @PatchMapping("/{id}")
    public ResponseEntity<StageDTO> updateStage(
            @PathVariable("id") Integer stageId,
            @RequestBody StageRequest request) {
        return ResponseEntity.ok(stageService.updateStage(stageId, request));
    }
}
