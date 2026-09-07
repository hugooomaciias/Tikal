package com.tikal.api.controller;

import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.service.ProjectService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    /**
     * POST /api/project
     * Create a new project.
     */
    @Operation(summary = "Crear proyecto", description = "Crea un nuevo proyecto.")
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Integer id) {
        System.out.println("\n Received request to delete project with ID: " + id);
        projectService.deleteProject(id);
        System.out.println("\n Deleted project with ID: " + id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/project/team
     * Returns projects that belong to the teams of the authenticated user.
     */
    @Operation(summary = "Obtener proyectos de mis equipos", description = "Devuelve los proyectos que pertenecen a los equipos del usuario autenticado.")
    @GetMapping("/team")
    public ResponseEntity<List<ProjectDTO>> getMyTeamProjects() {
        return ResponseEntity.ok(projectService.getMyTeamsProjects());
    }

    /**
     * PATCH /api/project/{id}
     * Update an existing project.
     */
    @Operation(summary = "Actualizar proyecto", description = "Actualiza un proyecto existente.")
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
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<ProjectDTO>> getTeamProjects(@PathVariable Integer teamId) {
        return ResponseEntity.ok(projectService.getTeamProjects(teamId));
    }
}
