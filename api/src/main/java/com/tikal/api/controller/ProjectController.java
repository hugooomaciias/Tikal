package com.tikal.api.controller;

import com.tikal.api.exception.dto.ErrorResponse;
import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Operaciones para gestionar proyectos")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {
    private final ProjectService projectService;

    /**
     * GET /api/project
     * Returns projects belonging to the authenticated user.
     */
    @Operation(summary = "Obtener mis proyectos", description = "Devuelve los proyectos pertenecientes al usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de proyectos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDTO.class)))
    })
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    /**
     * POST /api/project
     * Create a new project.
     */
    @Operation(summary = "Crear proyecto", description = "Crea un nuevo proyecto.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Proyecto creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDTO.class)))
    })
    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody CreateProjectRequest request) {
        ProjectDTO newProject = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProject);
    }

    /**
     * DELETE /api/project/{id}
     * Delete a project by id.
     */
    @Operation(summary = "Eliminar proyecto", description = "Elimina un proyecto por id.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Proyecto eliminado (sin contenido)")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Integer id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/project/team
     * Returns projects that belong to the teams of the authenticated user.
     */
    @Operation(summary = "Obtener proyectos de mis equipos", description = "Devuelve los proyectos que pertenecen a los equipos del usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de proyectos del equipo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDTO.class)))
    })
    @GetMapping("/team")
    public ResponseEntity<List<ProjectDTO>> getMyTeamProjects() {
        return ResponseEntity.ok(projectService.getMyTeamsProjects());
    }

    /**
     * PATCH /api/project/{id}
     * Update an existing project.
     */
    @Operation(summary = "Actualizar proyecto", description = "Actualiza un proyecto existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Proyecto actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDTO.class)))
    })
    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable("id") Integer projectId,
            @RequestBody UpdateProjectRequest request) {

        ProjectDTO updatedProject = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(updatedProject);
    }

    /**
     * GET /api/project/team/{teamId}
     * Returns projects for a specific team.
     */
    @Operation(summary = "Obtener proyectos de equipo", description = "Devuelve proyectos para un equipo específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de proyectos del equipo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectDTO.class)))
    })
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<ProjectDTO>> getTeamProjects(@Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId) {
        return ResponseEntity.ok(projectService.getTeamProjects(teamId));
    }
}
