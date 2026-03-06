package com.tikal.api.service;

import com.tikal.api.exception.NotFoundProjectException;
import com.tikal.api.exception.ProjectAccessDeniedException;
import com.tikal.api.model.dto.project.CreateProjectRequest;
import com.tikal.api.model.dto.project.ProjectDTO;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserService userService;

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setLogoUrl(request.getLogoUrl());
        project.setUserOwner(currentUser);
        project.setIsGroupBased(request.getIsGroupBased() != null ? request.getIsGroupBased() : false);

        if (project.getIsGroupBased()) {

        }

        Project savedProject = projectRepository.save(project);

        return mapToDTO(savedProject);
    }

    public List<ProjectDTO> getMyProjects() {
        User currentUser = userService.getAuthenticatedUser();

        List<Project> myProjects = projectRepository.findByUserOwner_Id(currentUser.getId());

        return myProjects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProject(Integer projectId) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundProjectException("Proyecto no encontrado"));

        if (!project.getUserOwner().getId().equals(currentUser.getId())) {
            throw new ProjectAccessDeniedException("No tienes permiso para borrar este proyecto.");
        }

        projectRepository.delete(project);
    }

    private ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .logoUrl(project.getLogoUrl())
                .isGroupBased(project.getIsGroupBased())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .build();
    }
}
