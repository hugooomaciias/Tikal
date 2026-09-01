package com.tikal.api.service;

import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.sync.ProjectDashboardDTO;
import com.tikal.api.model.dto.sync.domain.StageSyncDTO;
import com.tikal.api.model.dto.sync.domain.SubtaskSyncDTO;
import com.tikal.api.model.dto.sync.domain.TaskSyncDTO;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.TeamMember;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.ProjectRepository;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectDashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public ProjectDashboardDTO getProjectDashboard(Integer projectId) {
        User currentUser = userService.getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto", projectId));

        if (project.getIsGroupBased()) {
            boolean isMember = teamMemberRepository.existsByUserIdAndTeamId(currentUser.getId(), project.getTeam().getId());
            if (!isMember) {
                throw new ForbiddenAccessException("No tienes permiso para ver este proyecto.");
            }
        } else {
            if (!project.getUserOwner().getId().equals(currentUser.getId())) {
                throw new ForbiddenAccessException("No tienes permiso para ver este proyecto personal.");
            }
        }

        Integer leftDays = null;
        if (project.getDeadline() != null) {
            long days = ChronoUnit.DAYS.between(Instant.now(), project.getDeadline());
            leftDays = days > 0 ? (int) days : 0;
        }

        Object[] progressData = taskRepository.getProjectTaskProgress(projectId);
        int totalTasks = progressData[0] != null ? ((Number) progressData[0]).intValue() : 0;
        int completedTasks = progressData[1] != null ? ((Number) progressData[1]).intValue() : 0;
        int pendingTasks = totalTasks - completedTasks;

        int progress = 0;
        if (totalTasks > 0) {
            progress = (int) Math.round((completedTasks * 100.0) / totalTasks);
        }

        Double effectivenessRaw = taskRepository.getProjectTeamEffectiveness(projectId);
        Integer teamEffectiveness = effectivenessRaw != null ? (int) Math.round(effectivenessRaw) : 0;

        List<ProjectDashboardDTO.TeamMemberSyncDTO> membersData = buildTeamMembersWorkload(project);

        List<StageSyncDTO> stages = buildStagesForProject(project);
        List<CalendarEventDTO> events = buildEventsForProject(project);

        return ProjectDashboardDTO.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .logo(project.getLogoUrl())
                .leftDays(leftDays)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .progress(progress)
                .teamEffectiveness(teamEffectiveness)
                .totalLoggedMinutes(project.getTotalLoggedMinutes())
                .members(membersData)
                .stages(stages)
                .calendarEvents(events)
                .build();
    }

    // ==========================================
    // AUXILIAR METHOD FOR THE WORKLOAD
    // ==========================================
    private List<ProjectDashboardDTO.TeamMemberSyncDTO> buildTeamMembersWorkload(Project project) {
        if (!project.getIsGroupBased() || project.getTeam() == null) {
            return List.of();
        }

        List<TeamMember> teamMembers = teamMemberRepository.findByTeamId(project.getTeam().getId());

        List<Object[]> workloadData = taskRepository.getMemberWorkloadForProject(project.getId());

        Map<Integer, int[]> workloadMap = workloadData.stream().collect(Collectors.toMap(
                row -> ((Number) row[0]).intValue(),
                row -> new int[]{
                        row[1] != null ? ((Number) row[1]).intValue() : 0,
                        row[2] != null ? ((Number) row[2]).intValue() : 0
                }
        ));

        return teamMembers.stream().map(tm -> {
            int[] tasksCount = workloadMap.getOrDefault(tm.getUser().getId(), new int[]{0, 0});

            return ProjectDashboardDTO.TeamMemberSyncDTO.builder()
                    .id(tm.getUser().getId())
                    .name(tm.getUser().getName())
                    .avatar(tm.getUser().getAvatarUrl())
                    .role(tm.getTeamRole())
                    .pendingTasks(tasksCount[0])
                    .completedTasks(tasksCount[1])
                    .build();
        }).collect(Collectors.toList());
    }

    // ==========================================
    // VISUAL MAPPERS
    // ==========================================

    private List<StageSyncDTO> buildStagesForProject(Project project) {
        return project.getStages().stream().map(stage -> {
            List<TaskSyncDTO> taskDTOs = stage.getTasks().stream()
                    .filter(t -> t.getParentTask() == null)
                    .map(task -> mapTaskToDTO(task, project.getLogoUrl(), stage.getColour()))
                    .collect(Collectors.toList());

            return StageSyncDTO.builder()
                    .id(stage.getId())
                    .name(stage.getName())
                    .description(stage.getDescription())
                    .colour(stage.getColour())
                    .deadline(stage.getDeadline())
                    .logo(project.getLogoUrl())
                    .tasks(taskDTOs)
                    .build();
        }).collect(Collectors.toList());
    }

    private TaskSyncDTO mapTaskToDTO(Task task, String logo, String colour) {
        List<TaskSyncDTO.AssignedUser> assignedUsers = task.getAssignedUsers().stream()
                .map(u -> TaskSyncDTO.AssignedUser.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .avatar(u.getAvatarUrl())
                        .build())
                .toList();

        List<SubtaskSyncDTO> subtasks = task.getSubtasks() != null ? task.getSubtasks().stream()
                .map(sub -> SubtaskSyncDTO.builder()
                        .id(sub.getId())
                        .name(sub.getName())
                        .isCompleted(sub.getIsCompleted())
                        .build())
                .toList() : List.of();

        return TaskSyncDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .timeUnit(task.getTimeUnit())
                .estimatedProfit(task.getEstimatedProfit())
                .deadline(task.getDeadline())
                .isCompleted(task.getIsCompleted())
                .colour(colour)
                .logo(logo)
                .numberOfSubTask(subtasks.size())
                .subtasks(subtasks)
                .assignedUsers(assignedUsers)
                .build();
    }

    private List<CalendarEventDTO> buildEventsForProject(Project project) {
        return project.getCalendarEvents().stream().map(event -> {

            CalendarEventDTO.EventUser organizer = CalendarEventDTO.EventUser.builder()
                    .id(event.getOrganizer().getId())
                    .name(event.getOrganizer().getName())
                    .avatar(event.getOrganizer().getAvatarUrl())
                    .build();

            List<CalendarEventDTO.EventUser> attendees = event.getAttendees().stream()
                    .map(u -> CalendarEventDTO.EventUser.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .avatar(u.getAvatarUrl())
                            .build())
                    .toList();

            return CalendarEventDTO.builder()
                    .id(event.getId())
                    .name(event.getName())
                    .description(event.getDescription())
                    .initDateTime(event.getInitDateTime())
                    .endDateTime(event.getEndDateTime())
                    .colour(event.getCustomColour() != null ? event.getCustomColour() : "g2")
                    .logo(project.getLogoUrl())
                    .eventType(event.getEventType())
                    .organizer(organizer)
                    .attendees(attendees)
                    .build();
        }).collect(Collectors.toList());
    }
}
