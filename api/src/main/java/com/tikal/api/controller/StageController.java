package com.tikal.api.controller;

import com.tikal.api.exception.dto.ErrorResponse;
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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de stages", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StageDTO.class)))
    })
    @GetMapping
    public ResponseEntity<List<StageDTO>> getMyStages() {
        return ResponseEntity.ok(stageService.getMyStages());
    }

    /**
     * GET /api/stage/by_project/{id}
     * Returns stages that belong to a specific project.
     */
    @Operation(summary = "Obtener stages por proyecto", description = "Devuelve los stages que pertenecen a un proyecto específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de stages del proyecto", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StageDTO.class)))
    })
    @GetMapping("/by_project/{id}")
    public ResponseEntity<List<StageDTO>> getStagesByProject(@Parameter(description = "ID del proyecto", example = "5", in = ParameterIn.PATH) @PathVariable("id") Integer projectId) {
        return ResponseEntity.ok(stageService.getStagesByProject(projectId));
    }

    /**
     * POST /api/stage
     * Create a new stage.
     */
    @Operation(summary = "Crear stage", description = "Crea un nuevo stage.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Stage creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StageDTO.class)))
    })
    @PostMapping
    public ResponseEntity<StageDTO> createStage(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para crear un stage", required = true, content = @Content(schema = @Schema(implementation = StageRequest.class))) @RequestBody StageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stageService.createStage(request));
    }

    /**
     * DELETE /api/stage/{id}
     * Delete a stage by id.
     */
    @Operation(summary = "Eliminar stage", description = "Elimina un stage por id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Stage eliminado (sin contenido)")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStage(@Parameter(description = "ID del stage a eliminar", example = "3", in = ParameterIn.PATH) @PathVariable("id") Integer id) {
        stageService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/stage/{id}
     * Update an existing stage.
     */
    @Operation(summary = "Actualizar stage", description = "Actualiza un stage existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stage actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StageDTO.class)))
    })
    @PatchMapping("/{id}")
    public ResponseEntity<StageDTO> updateStage(
            @Parameter(description = "ID del stage", example = "3", in = ParameterIn.PATH) @PathVariable("id") Integer stageId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar del stage", required = true, content = @Content(schema = @Schema(implementation = StageRequest.class))) @RequestBody StageRequest request) {
        return ResponseEntity.ok(stageService.updateStage(stageId, request));
    }
}
