package com.tikal.api.service;

import com.tikal.api.exception.NotFoundProjectException;
import com.tikal.api.exception.NotFoundTeamMemberException;
import com.tikal.api.exception.ProjectAccessDeniedException;
import com.tikal.api.exception.TeamBadRequestException;
import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.TeamMemberRepository;
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
    private final TeamMemberRepository teamMemberRepository;

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setLogoUrl(request.getLogoUrl());
        project.setUserOwner(currentUser);
        project.setIsGroupBased(request.getIsGroupBased() != null ? request.getIsGroupBased() : false);

        if (project.getIsGroupBased()) {
            var team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new TeamBadRequestException(request.getTeamId().toString()));

            var teamMember = teamMemberRepository.findByUserIdAndTeamId(currentUser.getId(), team.getId())
                    .orElseThrow(() -> new NotFoundTeamMemberException(currentUser.getName(), team.getName()));

            if (!teamMember.getIsAdmin()) {
                throw new ProjectAccessDeniedException("No está permitido crear un proyecto nuevo, el usuario no es administrador.");
            }
            project.setTeam(team);
        }

        Project savedProject = projectRepository.save(project);

        return mapToDTO(savedProject);
    }

    public List<Project> getMyProjects() {
        User currentUser = userService.getAuthenticatedUser();

        return projectRepository.findByUserOwner_Id(currentUser.getId());
    }

    @Transactional
    public void deleteProject(Integer projectId) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundProjectException("Proyecto no encontrado"));

        if (!project.getIsGroupBased() && !project.getUserOwner().getId().equals(currentUser.getId())) {
            throw new ProjectAccessDeniedException("No tienes permiso para borrar este proyecto.");
        }

        if (project.getIsGroupBased()) {
            List<TeamMember> adminMembers =  teamMemberRepository.findTeamAdmins(project.getTeam().getId());
            boolean isCurrentUserAdmin = adminMembers.stream()
                    .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));
            if (!isCurrentUserAdmin) {
                throw new ProjectAccessDeniedException("Solo los administradores del equipo pueden borrar este proyecto grupal.");
            }
        }

        projectRepository.delete(project);
    }

    public List<ProjectDTO> getMyTeamsProjects() {
        User currentUser = userService.getAuthenticatedUser();

        List<Project> proyectos = projectRepository.findProjectsByUserId(currentUser.getId());

        return proyectos.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO updateProject(Integer projectId, UpdateProjectRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundProjectException("Proyecto no encontrado"));

        if (!project.getIsGroupBased() && !project.getUserOwner().getId().equals(currentUser.getId())) {
            throw new ProjectAccessDeniedException("No tienes permiso para editar este proyecto.");
        }

        if (project.getIsGroupBased()) {
            List<TeamMember> adminMembers = teamMemberRepository.findTeamAdmins(project.getTeam().getId());
            boolean isCurrentUserAdmin = adminMembers.stream()
                    .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));
            if (!isCurrentUserAdmin) {
                throw new ProjectAccessDeniedException("Solo los administradores del equipo pueden editar este proyecto grupal.");
            }
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }
        if (request.getLogoUrl() != null) {
            project.setLogoUrl(request.getLogoUrl());
        }

        project.setDeadline(request.getDeadline());
        project.setDescription(request.getDescription());
        Project updatedProject = projectRepository.save(project);
        return mapToDTO(updatedProject);
    }

    public ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .logoUrl(project.getLogoUrl())
                .isGroupBased(project.getIsGroupBased())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .teamName(project.getTeam() != null ? project.getTeam().getName() : null)
                .build();
    }
}
