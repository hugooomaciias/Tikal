package com.tikal.api.controller;

import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.model.entity.Project;
import com.tikal.api.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        List<Project> projectList = projectService.getMyProjects();

        return ResponseEntity.ok(projectList.stream()
                .map(projectService::mapToDTO)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody CreateProjectRequest request) {
        ProjectDTO newProject = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Integer id) {
        projectService.deleteProject(id);
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
}
