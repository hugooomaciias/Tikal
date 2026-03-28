package com.tikal.api.service;

import com.tikal.api.model.dto.UserSettingsDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO.*;
import com.tikal.api.model.dto.sync.domain.ProjectSyncDTO;
import com.tikal.api.model.dto.sync.domain.StageSyncDTO;
import com.tikal.api.model.dto.sync.domain.SubtaskSyncDTO;
import com.tikal.api.model.dto.sync.domain.TaskSyncDTO;
import com.tikal.api.model.dto.sync.widgets.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserService userService;
    private final SettingsService settingsService;
    private final GamificationService gamificationService;
    private final ProjectService projectService;
    private final StageRepository stageRepository;
    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;

    /**
     * Build the giant JSON for starting the application.
     */
    @Transactional(readOnly = true)
    public WorkspaceSyncDTO buildInitialWorkspaceSync() {
        User user = userService.getAuthenticatedUser();
        Integer userId = user.getId();
        UserSettings settings = settingsService.getSettingsByUserId(userId);

        UserProfileSyncDTO userProfile = buildUserProfile(user);
        UserSettingsDTO userSettings = settingsService.mapToDTO(settings);
        TempleSyncDTO templeMode = buildTempleMode(user);

        LayoutsDashboardMetadata layout = settings.getLayoutsDashboards();
        List<LayoutsDashboardMetadata.WidgetPosition> homeLayout = layout != null ? layout.getHome() : null;
        List<LayoutsDashboardMetadata.WidgetPosition> statsLayout = layout != null ? layout.getStatistics() : null;

        Map<String, WidgetData> homeWidgets = buildDashboardWidgetsMap(homeLayout, userId, settings);
        Map<String, WidgetData> statsWidgets = buildDashboardWidgetsMap(statsLayout, userId, settings);

        return WorkspaceSyncDTO.builder()
                .userProfile(userProfile)
                .settings(userSettings)
                .templeMode(templeMode)
                .calendarEvents(buildCalendarEvents(userId)) // Lista global de eventos
                .projects(buildProjectsList(userId))
                .homeGeneralInformation(buildHomeHeaders(userId)) // Tus nuevos headers
                .homeWidgetsData(homeWidgets)
                .statisticsGeneralInformation(buildStatsHeaders(userId)) // Tus nuevos headers
                .statisticsWidgetsData(statsWidgets)
                .build();
    }

    // ==========================================
    //      WIDGETS BUILDER
    // ==========================================
    private Map<String, WidgetData> buildDashboardWidgetsMap(
            List<LayoutsDashboardMetadata.WidgetPosition> layoutPositions,
            Integer userId,
            UserSettings settings) {

        Map<String, WidgetData> widgetsMap = new HashMap<>();

        if (layoutPositions == null || layoutPositions.isEmpty()) {
            return widgetsMap;
        }

        for (LayoutsDashboardMetadata.WidgetPosition pos : layoutPositions) {
            String widgetId = pos.getI();
            WidgetData data = WidgetBuilderService.buildSingleWidget(widgetId, userId, settings);

            if (data != null) {
                widgetsMap.put(widgetId, data);
            }
        }

        return widgetsMap;
    }

    // ==========================================
    //  PRIVATE CONSTRUCTION METHODS
    // ==========================================

    private UserProfileSyncDTO buildUserProfile(User user) {
        return UserProfileSyncDTO.builder()
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .subscriptionPlan(user.getSubscriptionPlan().name())
                .totems(buildUserTotems(user))
                .build();
    }

    private List<TotemSyncDTO> buildUserTotems(User user) {
        var totemList = gamificationService.obtainUserTotemInventory(user.getId());
        List<TotemSyncDTO> userTotems = new ArrayList<>();

        for (TotemInventory t : totemList) {
            var totemDTO = TotemSyncDTO.builder()
                    .id(t.getTotem().getId())
                    .name(t.getTotem().getName())
                    .goalDescription(t.getTotem().getGoalDescription())
                    .targetProgress(t.getTotem().getTargetProgress())
                    .totemImageUrl(t.getTotem().getTotemImageUrl())
                    .isActive(true)
                    .build();

            userTotems.add(totemDTO);
        }
        return userTotems;
    }

    private TempleSyncDTO buildTempleMode(User user) {
        return TempleSyncDTO.builder()
                .rank(user.getCurrentRank().getId())
                .templeName(user.getCurrentRank().getTempleName())
                .awardedTitle(user.getCurrentRank().getAwardedTitle())
                .requiredHours(user.getCurrentRank().getRequiredHours())
                .currentHours(gamificationService.getTotalTempleTime(user.getId()))
                .badgeImageUrl(user.getCurrentRank().getBadgeImageUrl())
                .clockImageUrl(user.getCurrentRank().getClockImageUrl())
                .templeImageUrl(user.getCurrentRank().getTempleImageUrl())
                .primaryColor(user.getCurrentRank().getColour())
                .totems(buildTempleTotems(user))
                .build();
    }

    private List<TotemSyncDTO> buildTempleTotems(User user) {
        var totemList = gamificationService.obtainRankTotemList(user.getCurrentRank().getId());
        List<TotemSyncDTO> templeTotems = new ArrayList<>();
        List<TotemList> totemActives = gamificationService.obtainTheActivesTotems(user.getId(), user.getCurrentRank().getId());

        for (TotemList t : totemList) {
            var totemDTO = TotemSyncDTO.builder()
                    .id(t.getId())
                    .name(t.getName())
                    .goalDescription(t.getGoalDescription())
                    .targetProgress(t.getTargetProgress())
                    .totemImageUrl(t.getTotemImageUrl())
                    .totemType(t.getTypeOfGoal())
                    .build();
            totemDTO.setCurrentProgress(gamificationService.obtainCurrentUserProgress(user.getId(), t.getTypeOfGoal()));

            totemDTO.setIsActive(false);
            if (totemActives.contains(t)) {
                totemDTO.setIsActive(true);
            }
            templeTotems.add(totemDTO);
        }
        return templeTotems;
    }

    private List<ProjectSyncDTO> buildProjectsList(Integer userId) {
        List<Project> projects = projectService.getMyProjects();
        if (projects.isEmpty()) return Collections.emptyList();

        List<Integer> projectIds = projects.stream().map(Project::getId).toList();

        List<Stage> allStages = stageRepository.findByProject_IdIn(projectIds);
        List<Integer> stagesIds = allStages.stream().map(Stage::getId).toList();

        List<Task> allTasks = stagesIds.isEmpty() ? Collections.emptyList() : taskRepository.findByStage_IdIn(stagesIds);

        Map<Integer, List<Stage>> stagesByProject = allStages.stream()
                .collect(Collectors.groupingBy(stage -> stage.getProject().getId()));

        Map<Integer, List<Task>> mainTaskByStage = allTasks.stream()
                .filter(task -> task.getParentTask() == null)
                .collect(Collectors.groupingBy(task -> task.getStage().getId()));

        Map<Integer, List<Task>> subtaskByParent = allTasks.stream()
                .filter(task -> task.getParentTask() != null)
                .collect(Collectors.groupingBy(task -> task.getParentTask().getId()));

        return projects.stream()
                .map(project -> mapProjectToProjectSyncDTO(project, stagesByProject, mainTaskByStage, subtaskByParent))
                .collect(Collectors.toList());
    }

    // ==========================================
    //      MAP TO DTO METHODS
    // ==========================================
    private ProjectSyncDTO mapProjectToProjectSyncDTO (Project project,
                                                       Map<Integer, List<Stage>> stagesByProject,
                                                       Map<Integer, List<Task>> mainTaskByStage,
                                                       Map<Integer, List<Task>> subtaskByParent) {
        List<Stage> myStages = stagesByProject.getOrDefault(project.getId(), Collections.emptyList());

        List<StageSyncDTO> stageDTOs = myStages.stream()
                .map(stage -> mapStageToStageSyncDTO(stage, mainTaskByStage, subtaskByParent))
                .collect(Collectors.toList());

        return ProjectSyncDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .logoUrl(project.getLogoUrl())
                .description(project.getDescription())
                .deadline(project.getDeadline())
                .stages(stageDTOs)
                .build();
    }

    private StageSyncDTO mapStageToStageSyncDTO (Stage stage,
                                                 Map<Integer, List<Task>> mainTaskByStage,
                                                 Map<Integer, List<Task>> subtaskByParent) {
        List<Task> myTasks = mainTaskByStage.getOrDefault(stage.getId(), Collections.emptyList());

        List<TaskSyncDTO> taskDTOs = myTasks.stream()
                .map(task -> mapTaskToTaskSyncDTO(task, subtaskByParent))
                .collect(Collectors.toList());

        return StageSyncDTO.builder()
                .id(stage.getId())
                .name(stage.getName())
                .description(stage.getDescription())
                .colour(stage.getColour())
                .deadline(stage.getDeadline())
                .tasks(taskDTOs)
                .build();
    }

    private TaskSyncDTO mapTaskToTaskSyncDTO(Task task, Map<Integer, List<Task>> subtaskByParent) {

        List<Task> mySubtasks = subtaskByParent.getOrDefault(task.getId(), Collections.emptyList());

        List<SubtaskSyncDTO> subtaskSyncDTOS = mySubtasks.stream()
                .map(this::mapSubTaskToSubtaskSyncDTO)
                .collect(Collectors.toList());

        return TaskSyncDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .estimatedProfit(task.getEstimatedProfit())
                .deadline(task.getDeadline())
                .isCompleted(task.getIsCompleted())
                .numberOfSubTask(subtaskSyncDTOS.size())
                .subtasks(subtaskSyncDTOS)
                .build();
    }

    private SubtaskSyncDTO mapSubTaskToSubtaskSyncDTO(Task task) {
        return SubtaskSyncDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .estimatedProfit(task.getEstimatedProfit())
                .deadline(task.getDeadline())
                .isCompleted(task.getIsCompleted())
                .build();
    }
}