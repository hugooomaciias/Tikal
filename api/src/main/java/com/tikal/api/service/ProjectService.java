package com.tikal.api.service;

import com.tikal.api.exception.*;
import com.tikal.api.model.dto.task.CreateProjectRequest;
import com.tikal.api.model.dto.task.ProjectDTO;
import com.tikal.api.model.dto.task.UpdateProjectRequest;
import com.tikal.api.model.entity.CalendarEvent;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.enumerated.EventType;
import com.tikal.api.model.entity.enumerated.ProjectType;
import com.tikal.api.repository.CalendarEventRepository;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.TeamMemberRepository;
import com.tikal.api.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final UserService userService;

    public List<ProjectDTO> getMyProjects() {
        User currentUser = userService.getAuthenticatedUser();

        List<Project> projects = projectRepository.findByUserOwner_Id(currentUser.getId());

        if (projects.isEmpty()) {
            return List.of();
        }

        List<Integer> projectIds = projects.stream().map(Project::getId).toList();

        return mapProjectsWithDeadlines(projects, projectIds);
    }

    public List<ProjectDTO> getMyTeamsProjects() {
        User currentUser = userService.getAuthenticatedUser();

        List<Project> projects = projectRepository.findProjectsByUserId(currentUser.getId());

        if (projects.isEmpty()) {
            return List.of();
        }

        List<Integer> projectIds = projects.stream().map(Project::getId).toList();

        return mapProjectsWithDeadlines(projects, projectIds);
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setLogoUrl(request.getLogo());
        project.setIsGroupBased(request.getIsGroupBased() != null ? request.getIsGroupBased() : false);
        if (request.getType() != null) {
            project.setProjectType(ProjectType.valueOf(request.getType().toUpperCase()) );
        }

        // Team validation for admins
        if (project.getIsGroupBased()) {
            var team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new BadRequestException(request.getTeamId().toString()));

            var teamMember = teamMemberRepository.findByUserIdAndTeamId(currentUser.getId(), team.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Miembro del equipo", team.getName()));

            if (!teamMember.getIsAdmin()) {
                throw new ForbiddenAccessException("No está permitido crear un proyecto nuevo, el usuario no es administrador.");
            }
            project.setTeam(team);
            project.setUserOwner(null);
        } else {
            project.setUserOwner(currentUser);
        }

        Project savedProject = projectRepository.save(project);

         // Calendar event logic
        boolean addToCalendar = false;
        if (Boolean.TRUE.equals(request.getAddToCalendar()) && savedProject.getDeadline() != null) {
            createDeadlineEvent(savedProject, currentUser);
            addToCalendar = true;
        }

        return mapToDTO(savedProject, addToCalendar);
    }

    @Transactional
    public void deleteProject(Integer projectId) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto", projectId));

        // Security validation
        if (!project.getIsGroupBased() && !project.getUserOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenAccessException("No tienes permiso para borrar este proyecto.");
        }

        // Team validation for admins
        if (project.getIsGroupBased()) {
            List<TeamMember> adminMembers =  teamMemberRepository.findTeamAdmins(project.getTeam().getId());
            boolean isCurrentUserAdmin = adminMembers.stream()
                    .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));
            if (!isCurrentUserAdmin) {
                throw new ForbiddenAccessException("Solo los administradores del equipo pueden borrar este proyecto grupal.");
            }
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDTO updateProject(Integer projectId, UpdateProjectRequest request) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto", projectId));

        // Security validation
        if (!project.getIsGroupBased() && !project.getUserOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenAccessException("No tienes permiso para editar este proyecto.");
        }

        // Team validation for admins
        if (project.getIsGroupBased()) {
            List<TeamMember> adminMembers = teamMemberRepository.findTeamAdmins(project.getTeam().getId());
            boolean isCurrentUserAdmin = adminMembers.stream()
                    .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));
            if (!isCurrentUserAdmin) {
                throw new ForbiddenAccessException("Solo los administradores del equipo pueden editar este proyecto grupal.");
            }
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }
        if (request.getLogo() != null) {
            project.setLogoUrl(request.getLogo());
        }
        if (request.getType() != null) {
            project.setProjectType(ProjectType.valueOf(request.getType().toUpperCase()) );
        }
        project.setDeadline(request.getDeadline());
        project.setDescription(request.getDescription());

        Project updatedProject = projectRepository.save(project);

        boolean hasDeadline = syncDeadlineEvent(updatedProject, currentUser, request.getAddToCalendar());

        return mapToDTO(updatedProject, hasDeadline);
    }

    public List<ProjectDTO> getTeamProjects(Integer teamId) {
        User currentUser = userService.getAuthenticatedUser();

        boolean isMember = teamMemberRepository.existsByUserIdAndTeamId(currentUser.getId(), teamId);
        if (!isMember) {
            throw new ForbiddenAccessException("No tienes permiso para ver los proyectos de este equipo.");
        }

        List<Project> projects = projectRepository.findByTeam_Id(teamId);

        if (projects.isEmpty()) {
            return List.of();
        }

        List<Integer> projectIds = projects.stream().map(Project::getId).toList();
        return mapProjectsWithDeadlines(projects, projectIds);
    }

    // ==========================================
    //          AUXILIARY METHODS
    // ==========================================

    private List<ProjectDTO> mapProjectsWithDeadlines(List<Project> projects, List<Integer> projectIds) {
        List<CalendarEvent> deadlineEvents = calendarEventRepository
                .findByProjectIdInAndEventTypeAndStageIsNullAndTaskIsNull(projectIds, EventType.DEADLINE);
        
        Set<Integer> projectsWithDeadline = deadlineEvents.stream()
                .filter(event -> event.getProject() != null)
                .map(event -> event.getProject().getId())
                .collect(Collectors.toSet());

        return projects.stream()
                .map(project -> {
                    boolean hasDeadlineEvent = projectsWithDeadline.contains(project.getId());
                    return mapToDTO(project, hasDeadlineEvent);
                })
                .toList();
    }

    private void createDeadlineEvent(Project project, User user) {
        CalendarEvent event = new CalendarEvent();
        event.setName("Entrega: " + project.getName());
        event.setInitDateTime(project.getDeadline().minus(1, ChronoUnit.HOURS));
        event.setEndDateTime(project.getDeadline());
        event.setEventType(EventType.DEADLINE);
        event.setOrganizer(user);
        event.getAttendees().add(user);
        event.setProject(project);
        calendarEventRepository.save(event);
    }

    private boolean syncDeadlineEvent(Project project, User user, Boolean requestedAddToCalendar) {
        // We search if the event exist in the database
        Optional<CalendarEvent> existingEventOpt = calendarEventRepository
                .findByProjectIdAndEventTypeAndStageIsNullAndTaskIsNull(project.getId(), EventType.DEADLINE);

        boolean wantsInCalendar = Boolean.TRUE.equals(requestedAddToCalendar) && project.getDeadline() != null;

        if (wantsInCalendar) {
            if (existingEventOpt.isPresent()) {
                // Case A: The user want in calendar, and it already existed -> We update the date and name in case it changed
                CalendarEvent event = existingEventOpt.get();
                event.setName("Entrega: " + project.getName());
                event.setInitDateTime(project.getDeadline().minus(1, ChronoUnit.HOURS));
                event.setEndDateTime(project.getDeadline());
                calendarEventRepository.save(event);
            } else {
                // Case B: The user want in calendar, and it doesn’t exist -> We’ll create it
                createDeadlineEvent(project, user);
            }
            return true;
        } else {
            // Case C: The user don't want the deadline in the calendar, but exists -> We'll delete it
            existingEventOpt.ifPresent(calendarEventRepository::delete);
            return false;
        }
    }

    private ProjectDTO mapToDTO(Project project, boolean addToCalendar) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .deadline(project.getDeadline())
                .logo(project.getLogoUrl())
                .isGroupBased(project.getIsGroupBased())
                .teamId(project.getTeam() != null ? project.getTeam().getId() : null)
                .teamImage(project.getTeam() != null ? project.getTeam().getImageUrl(): null)
                .teamName(project.getTeam() != null ? project.getTeam().getName() : null)
                .addToCalendar(addToCalendar)
                .type(project.getProjectType())
                .build();
    }
}
