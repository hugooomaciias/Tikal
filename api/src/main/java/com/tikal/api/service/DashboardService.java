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
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.repository.*;
import com.tikal.api.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
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
    private final WidgetBuilderService widgetBuilderService;
    private final CalendarEventRepository calendarEventRepository;
    private final StatisticsService statisticsService;
    private final TimeLogRepository timeLogRepository;
    private final ProjectRepository projectRepository;

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
                .calendarEvents(buildCalendarEvents(userId))
                .tasks(buildProjectsList(userId))
                .homeGeneralInformation(buildHomeHeaders(userId))
                .homeWidgetsData(homeWidgets)
                .statisticsGeneralInformation(buildStatsHeaders(user))
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
            WidgetData data = widgetBuilderService.buildSingleWidget(widgetId, userId, settings);

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

    private List<CalendarEventSyncDTO> buildCalendarEvents(Integer userId) {
        LocalDateTime now = LocalDateTime.now();

        // First day of the previous month
        LocalDateTime windowStart = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);

        // Last day in 3 months
        LocalDateTime windowEnd = now.plusMonths(3).with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);

        List<CalendarEvent> eventsInWindow = calendarEventRepository.findEventsInWindow(userId, windowStart, windowEnd);

        // Map entity to DTO
        return eventsInWindow.stream().map(event -> {
            // Color logic
            String eventColor = event.getCustomColour();
            if (eventColor == null && event.getStage() != null) {
                eventColor = event.getStage().getColour();
            }
            if (eventColor == null) {
                eventColor = "#6A98F0";
            }

            return WorkspaceSyncDTO.CalendarEventSyncDTO.builder()
                    .id(event.getId())
                    .title(event.getName())
                    .description(event.getDescription())
                    .startDate(event.getInitDateTime())
                    .endDate(event.getEndDateTime())
                    .color(eventColor)
                    .build();

        }).collect(Collectors.toList());
    }

    private List<HeaderInformation> buildHomeHeaders(Integer userId) {
        // 1. Tareas Pendientes
        Integer pendingTasks = taskRepository.countByAssignedUser_IdAndIsCompletedFalse(userId);

        // 2. Minutos trabajados HOY
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        Integer todayMinutesWrapper = timeLogRepository.getTotalMinutesBetweenDates(userId, startOfToday, endOfToday);
        int todayMinutes = todayMinutesWrapper != null ? todayMinutesWrapper : 0;
        String hoursAndMins = DateUtils.formatMinutes(todayMinutes);

        // 3. Proyectos (Ajusta la llamada a tu repositorio de proyectos)
        Integer totalProjects = projectRepository.countByUserOwnerId(userId);

        return List.of(
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Tareas pendientes")
                        .value(String.valueOf(pendingTasks != null ? pendingTasks : 0))
                        .logo("IconTrendingUp")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Tiempo hoy")
                        .value(hoursAndMins)
                        .logo("IconClockHour3Filled")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Proyectos totales")
                        .value(String.valueOf(totalProjects != null ? totalProjects : 0))
                        .logo("IconClipboardTextFilled")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Proyectos totales")
                        .value(String.valueOf(totalProjects != null ? totalProjects : 0))
                        .logo("IconClipboardTextFilled")
                        .custom("")
                        .build()
        );
    }

    private List<HeaderInformation> buildStatsHeaders(User user) {
        Integer userId = user.getId();

        // 1. Total Hours Register
        Integer totalHistoricalMinutes = timeLogRepository.getHistoricalTotalMinutes(userId);
        int totalMins = (totalHistoricalMinutes != null ? totalHistoricalMinutes : 0);
        String hoursAndMins = DateUtils.formatMinutes(totalMins);

        // 2. Global effectiveness
        Integer effectiveness = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);

        // 3. Planification
        Integer planification = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);

        return List.of(
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Horas registradas")
                        .value(hoursAndMins)
                        .logo("IconClockHour3Filled")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Eficiencia global")
                        .value(String.valueOf(effectiveness != null ? effectiveness : 0))
                        .logo("IconBoltFilled")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Planificación")
                        .value(String.valueOf(planification != null ? planification : 0))
                        .logo("IconTimelineEventFilled")
                        .custom("")
                        .build(),
                WorkspaceSyncDTO.HeaderInformation.builder()
                        .title("Rango actual")
                        .value(String.valueOf(user.getCurrentRank().getId()))
                        .logo("IconBadgesFilled")
                        .custom("rotate-180")
                        .build()
        );
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
                .logo(project.getLogoUrl())
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