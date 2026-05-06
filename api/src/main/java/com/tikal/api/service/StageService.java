package com.tikal.api.service;

import com.tikal.api.exception.ProjectAccessDeniedException;
import com.tikal.api.model.dto.task.StageDTO;
import com.tikal.api.model.dto.task.StageRequest;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.EventType;
import com.tikal.api.repository.CalendarEventRepository;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.StageRepository;
import com.tikal.api.repository.TeamMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StageService {
    private final StageRepository stageRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final UserService userService;

    public List<StageDTO> getMyStages() {
        User user = userService.getAuthenticatedUser();
        List<Stage> stages = stageRepository.findByUserId(user.getId());

        if (stages.isEmpty()) {
            return List.of();
        }

        List<Integer> stageIds = stages.stream().map(Stage::getId).toList();

        return mapStageWithDeadlines(stages, stageIds);
    }

    public List<StageDTO> getStagesByProject(Integer projectId) {
        User user = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Debe existir el proyecto por el que se quieren listar las fases"));

        validateStagePermissions(project, user, "ver");

        List<Stage> stages = stageRepository.findByProjectId(projectId);

        if (stages.isEmpty()) {
            return List.of();
        }

        List<Integer> stageIds = stages.stream().map(Stage::getId).toList();

        return mapStageWithDeadlines(stages, stageIds);
    }

    @Transactional
    public StageDTO createStage(StageRequest request) {
        User user = userService.getAuthenticatedUser();
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("El proyecto adjunto debe de existir"));

        validateStagePermissions(project, user, "crear");

        Stage stage = Stage.builder()
                .name(request.getName())
                .description(request.getDescription())
                .colour(request.getColour())
                .deadline(request.getDeadline())
                .project(project)
                .build();

        Stage savedStage = stageRepository.save(stage);

        // Calendar event logic
        boolean addToCalendar = false;
        if (Boolean.TRUE.equals(request.getAddToCalendar()) && savedStage.getDeadline() != null) {
            createDeadlineEvent(savedStage, user);
            addToCalendar = true;
        }

        return toDto(savedStage, addToCalendar);
    }

    @Transactional
    public void deleteStage(Integer id) {
        User user = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe la fase que se quiere eliminar"));

        validateStagePermissions(stage.getProject(), user, "borrar");

        stageRepository.delete(stage);
    }

    @Transactional
    public StageDTO updateStage(Integer stageId, StageRequest request) {
        User user = userService.getAuthenticatedUser();
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new RuntimeException("No existe la fase que se quiere editar"));

        validateStagePermissions(stage.getProject(), user, "actualizar");

        if (request.getName() != null && !request.getName().isBlank()) {
            stage.setName(request.getName());
        }
        if (request.getColour() != null) {
            stage.setColour(request.getColour());
        }
        stage.setDescription(request.getDescription());
        stage.setDeadline(request.getDeadline());

        Stage updatedStage = stageRepository.save(stage);

        boolean hasDeadline = syncDeadlineEvent(updatedStage, user, request.getAddToCalendar());

        return toDto(updatedStage, hasDeadline);
    }

    // ==========================================
    //          AUXILIARY METHODS
    // ==========================================

    private void validateStagePermissions(Project project, User user, String action) {
        if (project.getIsGroupBased()) {
            if (action.equalsIgnoreCase("ver")) {
                boolean isMember = teamMemberRepository
                        .findByUserIdAndTeamId(user.getId(), project.getTeam().getId())
                        .isPresent();

                if (!isMember) {
                    throw new ProjectAccessDeniedException("Debes ser miembro del equipo para ver las fases de este proyecto.");
                }
            } else {
                List<TeamMember> adminMembers = teamMemberRepository.findTeamAdmins(project.getTeam().getId());
                boolean isCurrentUserAdmin = adminMembers.stream()
                        .anyMatch(member -> member.getUser().getId().equals(user.getId()));

                if (!isCurrentUserAdmin) {
                    throw new ProjectAccessDeniedException("Solo los administradores del equipo pueden " + action + " una fase para este proyecto.");
                }
            }
        } else {
            if (project.getUserOwner() == null || !project.getUserOwner().getId().equals(user.getId())) {
                throw new ProjectAccessDeniedException("No tienes permiso para " + action + " una fase en este proyecto personal.");
            }
        }
    }

    private List<StageDTO> mapStageWithDeadlines(List<Stage> stages, List<Integer> stagesIds) {
        List<CalendarEvent> deadlineEvents = calendarEventRepository
                .findByStageIdInAndEventTypeAndTaskIsNull(stagesIds, EventType.DEADLINE);

        Set<Integer> stagesWithDeadline = deadlineEvents.stream()
                .filter(event -> event.getStage() != null)
                .map(event -> event.getStage().getId())
                .collect(Collectors.toSet());

        return stages.stream()
                .map(stage -> {
                    boolean hasDeadlineEvent = stagesWithDeadline.contains(stage.getId());
                    return toDto(stage, hasDeadlineEvent);
                })
                .toList();
    }

    private void createDeadlineEvent(Stage stage, User user) {
        CalendarEvent event = new CalendarEvent();
        event.setName("Entrega: " + stage.getName());
        event.setInitDateTime(stage.getDeadline().minusHours(1));
        event.setEndDateTime(stage.getDeadline());
        event.setEventType(EventType.DEADLINE);
        event.setUser(user);
        event.setProject(stage.getProject());
        event.setStage(stage);
        calendarEventRepository.save(event);
    }

    private boolean syncDeadlineEvent(Stage stage, User user, Boolean requestedAddToCalendar) {
        // We search if the event exist in the database
        Optional<CalendarEvent> existingEventOpt = calendarEventRepository
                .findByStageIdAndEventTypeAndTaskIsNull(stage.getId(), EventType.DEADLINE);

        boolean wantsInCalendar = Boolean.TRUE.equals(requestedAddToCalendar) && stage.getDeadline() != null;

        if (wantsInCalendar) {
            if (existingEventOpt.isPresent()) {
                // Case A: The user want in calendar, and it already existed -> We update the date and name in case it changed
                CalendarEvent event = existingEventOpt.get();
                event.setName("Entrega: " + stage.getName());
                event.setInitDateTime(stage.getDeadline().minusHours(1));
                event.setEndDateTime(stage.getDeadline());
                calendarEventRepository.save(event);
            } else {
                // Case B: The user want in calendar, and it doesn’t exist -> We’ll create it
                createDeadlineEvent(stage, user);
            }
            return true;
        } else {
            // Case C: The user don't want the deadline in the calendar, but exists -> We'll delete it
            existingEventOpt.ifPresent(calendarEventRepository::delete);
            return false;
        }
    }

    private StageDTO toDto(Stage stage, boolean addToCalendar) {
        return StageDTO.builder()
                .id(stage.getId())
                .name(stage.getName())
                .description(stage.getDescription())
                .colour(stage.getColour())
                .deadline(stage.getDeadline())
                .templeLoggedMinutes(stage.getTempleLoggedMinutes())
                .totalLoggedMinutes(stage.getTotalLoggedMinutes())
                .logo(stage.getProject().getLogoUrl())
                .addToCalendar(addToCalendar)
                .type(stage.getProject().getProjectType())
                .build();
    }
}
