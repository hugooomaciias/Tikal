package com.tikal.api.controller;

import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.model.entity.Project;
import com.tikal.api.service.ProjectService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/project")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody CreateProjectRequest request) {
        ProjectDTO newProject = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Integer id) {
        System.out.println("\n Received request to delete project with ID: " + id);
        projectService.deleteProject(id);
        System.out.println("\n Deleted project with ID: " + id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team")
    public ResponseEntity<List<ProjectDTO>> getMyTeamProjects() {
        return ResponseEntity.ok(projectService.getMyTeamsProjects());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable("id") Integer projectId,
            @RequestBody UpdateProjectRequest request) {

        ProjectDTO updatedProject = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(updatedProject);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<ProjectDTO>> getTeamProjects(@PathVariable Integer teamId) {
        return ResponseEntity.ok(projectService.getTeamProjects(teamId));
    }
}
