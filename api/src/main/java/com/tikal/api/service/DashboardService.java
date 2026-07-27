package com.tikal.api.service;

import com.tikal.api.model.dto.UserSettingsDTO;
import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO.*;
import com.tikal.api.model.dto.sync.domain.ProjectSyncDTO;
import com.tikal.api.model.dto.sync.domain.StageSyncDTO;
import com.tikal.api.model.dto.sync.domain.SubtaskSyncDTO;
import com.tikal.api.model.dto.sync.domain.TaskSyncDTO;
import com.tikal.api.model.dto.sync.widgets.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.model.entity.enumerated.EventType;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.repository.*;
import com.tikal.api.service.cache.PreFetchedDashboardData;
import com.tikal.api.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserService userService;
    private final SettingsService settingsService;
    private final GamificationService gamificationService;
    private final TaskRepository taskRepository;
    private final WidgetBuilderService widgetBuilderService;
    private final CalendarEventRepository calendarEventRepository;
    private final StatisticsService statisticsService;
    private final TimeLogRepository timeLogRepository;
    private final ProjectRepository projectRepository;
    private final PreFetchedDashboardData preFetchedData;

    /**
     * Build the giant JSON for starting the application.
     */
    @Transactional(readOnly = true)
    public WorkspaceSyncDTO buildInitialWorkspaceSync() {
        User user = userService.getAuthenticatedUser();
        Integer userId = user.getId();
        UserSettings settings = settingsService.getSettingsByUserId(userId);
        preFetchTimeLogsForDashboard(user.getId(), settings);

        UserProfileSyncDTO userProfile = buildUserProfile(user);
        UserSettingsDTO userSettings = settingsService.mapToDTO(settings);
        TempleSyncDTO templeMode = buildTempleMode(user);

        // Widgets builders
        LayoutsDashboardMetadata layout = settings.getLayoutsDashboards();
        List<LayoutsDashboardMetadata.WidgetPosition> homeLayout = layout != null ? layout.getHome() : null;
        List<LayoutsDashboardMetadata.WidgetPosition> statsLayout = layout != null ? layout.getStatistics() : null;

        Map<String, WidgetData> homeWidgets = buildDashboardWidgetsMap(homeLayout, user, settings);
        Map<String, WidgetData> statsWidgets = buildDashboardWidgetsMap(statsLayout, user, settings);

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
            User user,
            UserSettings settings) {

        Map<String, WidgetData> widgetsMap = new HashMap<>();

        if (layoutPositions == null || layoutPositions.isEmpty()) {
            return widgetsMap;
        }

        for (LayoutsDashboardMetadata.WidgetPosition pos : layoutPositions) {
            String widgetId = pos.getI();
            WidgetData data = widgetBuilderService.buildSingleWidget(widgetId, user, settings);

            if (data != null) {
                widgetsMap.put(widgetId, data);
            }
        }

        return widgetsMap;
    }

    // ===================================================
    //  DATA PRE-FETCHING FOR DASHBOARD (OPTIMIZATION)
    // ===================================================
    private void preFetchTimeLogsForDashboard(Integer userId, UserSettings settings) {
        // Obtenemos el 'hoy' base en UTC
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // 1. TODAY
        Instant todayStart = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant todayEnd = today.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        List<TimeLog> todayLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, todayStart, todayEnd);
        preFetchedData.setTodayTotalMinutes(sumMinutes(todayLogs));

        // 2. CURRENT ALIGNED WEEK
        // Asumiendo que getWeekStart devuelve LocalDateTime. Lo dejamos local temporalmente para sumar días.
        LocalDateTime weekStartLocal = PreFetchedDashboardData.getWeekStart(settings);
        LocalDateTime weekEndLocal = weekStartLocal.plusDays(6).withHour(23).withMinute(59).withSecond(59);

        Instant weekStart = weekStartLocal.toInstant(ZoneOffset.UTC);
        Instant weekEnd = weekEndLocal.toInstant(ZoneOffset.UTC);

        List<TimeLog> weekLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, weekStart, weekEnd);
        preFetchedData.setCurrentWeekTotalMinutes(sumMinutes(weekLogs));
        preFetchedData.setCurrentWeekTempleMinutes(sumTempleMinutes(weekLogs));
        preFetchedData.setWeekConcentrationPercentage(computeDailyConcentration(weekLogs));
        preFetchedData.setWeekDailyMinutes(groupByDate(weekLogs));

        // 3. PREVIOUS ALIGNED WEEK (¡Bug de fechas idénticas corregido!)
        LocalDateTime prevWeekStartLocal = weekStartLocal.minusWeeks(1);
        LocalDateTime prevWeekEndLocal = prevWeekStartLocal.plusDays(6).withHour(23).withMinute(59).withSecond(59);

        Instant prevWeekStart = prevWeekStartLocal.toInstant(ZoneOffset.UTC);
        Instant prevWeekEnd = prevWeekEndLocal.toInstant(ZoneOffset.UTC);

        List<TimeLog> prevWeekLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, prevWeekStart, prevWeekEnd);
        preFetchedData.setPrevWeekTotalMinutes(sumMinutes(prevWeekLogs));
        preFetchedData.setPrevWeekTempleMinutes(sumTempleMinutes(prevWeekLogs));

        // 4. ROLLING WEEK (Últimos 7 días)
        LocalDate startDate = today.minusDays(6);

        Instant rollingStart = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant rollingEnd = today.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        List<TimeLog> rollingWeekLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, rollingStart, rollingEnd);
        preFetchedData.setRollingWeekDailyMinutes(groupByDate(rollingWeekLogs));

        log.info("Pre fetch");

        // 5. CURRENT MONTH
        LocalDate monthStartDate = today.withDayOfMonth(1);

        Instant monthStart = monthStartDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant monthEnd = monthStartDate.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        List<TimeLog> monthLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, monthStart, monthEnd);
        preFetchedData.setMonthLogs(monthLogs);
        preFetchedData.setCurrentMonthTotalMinutes(sumMinutes(monthLogs));
        preFetchedData.setCurrentMonthTempleMinutes(sumTempleMinutes(monthLogs));
        preFetchedData.setMonthDailyMinutes(groupByDate(monthLogs));
        preFetchedData.setMonthConcentrationPercentage(computeDailyConcentration(monthLogs));
        log.info("Post fetch");

        // 6. PREVIOUS MONTH
        LocalDate prevMonthStartDate = monthStartDate.minusMonths(1);

        Instant prevMonthStart = prevMonthStartDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant prevMonthEnd = prevMonthStartDate.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        List<TimeLog> prevMonthLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(userId, prevMonthStart, prevMonthEnd);
        preFetchedData.setPrevMonthTotalMinutes(sumMinutes(prevMonthLogs));
        preFetchedData.setPrevMonthTempleMinutes(sumTempleMinutes(prevMonthLogs));

        // 7. GLOBALES
        Integer globalTempleMinutes = timeLogRepository.sumMinutesInTempleModeByUserId(userId);
        preFetchedData.setGlobalTempleMinutes(globalTempleMinutes == null ? 0 : globalTempleMinutes);

        Integer globalTotalMinutes = timeLogRepository.getHistoricalTotalMinutes(userId);
        preFetchedData.setGlobalTotalMinutes(globalTotalMinutes == null ? 0 : globalTotalMinutes);
    }

    private int sumMinutes(List<TimeLog> logs) {
        return logs.stream().mapToInt(TimeLog::getMinutes).sum();
    }

    private int sumTempleMinutes(List<TimeLog> logs) {
        return logs.stream().filter(TimeLog::getIsTempleMode).mapToInt(TimeLog::getMinutes).sum();
    }

    private Map<LocalDate, Integer> groupByDate(List<TimeLog> logs) {
        return logs.stream().collect(Collectors.groupingBy(
                tl -> LocalDate.ofInstant(tl.getInitDateTime(), ZoneOffset.UTC),
                Collectors.summingInt(TimeLog::getMinutes)
        ));
    }

    private Map<LocalDate, Double> computeDailyConcentration(List<TimeLog> logs) {
        // Group by date, compute total minutes and temple minutes, then percentage
        Map<LocalDate, int[]> dailyStats = logs.stream().collect(Collectors.groupingBy(
                tl -> LocalDate.ofInstant(tl.getInitDateTime(), ZoneOffset.UTC),
                Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> {
                            int total = list.stream().mapToInt(TimeLog::getMinutes).sum();
                            int temple = list.stream().filter(TimeLog::getIsTempleMode).mapToInt(TimeLog::getMinutes).sum();
                            return new int[]{total, temple};
                        }
                )
        ));
        Map<LocalDate, Double> result = new HashMap<>();
        for (Map.Entry<LocalDate, int[]> entry : dailyStats.entrySet()) {
            int total = entry.getValue()[0];
            int temple = entry.getValue()[1];
            double pct = total > 0 ? (temple * 100.0 / total) : 0.0;
            result.put(entry.getKey(), Math.round(pct * 10.0) / 10.0);
        }
        return result;
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
                .requiredHours(user.getCurrentRank().getNextHours())
                .currentHours(preFetchedData.getGlobalTempleMinutes() / 60)
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
        // 1. Fetch projects, stages, tasks in ONE query
        List<Project> projectsWithStagesAndTasks = projectRepository.findProjectsWithStage(userId);

        if (projectsWithStagesAndTasks.isEmpty()) return Collections.emptyList();

        // 2. Collect all stage IDs and task IDs for deadline query
        Set<Integer> projectIds = new HashSet<>();
        Set<Integer> stageIds = new HashSet<>();
        for (Project p : projectsWithStagesAndTasks) {
            projectIds.add(p.getId());
            for (Stage s : p.getStages()) {
                stageIds.add(s.getId());
            }
        }

        List<Task> allTasks = taskRepository.findByStage_IdIn(stageIds.stream().toList());

        Map<Integer, List<Task>> tasksByStage = new HashMap<>();
        Map<Integer, List<Task>> subtaskByParent = new HashMap<>();
        Set<Integer> taskIds = new HashSet<>();

        for (Task t : allTasks) {
            Stage stage = t.getStage();
            if (stage != null) {
                tasksByStage.computeIfAbsent(stage.getId(), k -> new ArrayList<>()).add(t);
            }
            if (t.getParentTask() == null) {
                taskIds.add(t.getId());
            } else {
                subtaskByParent.computeIfAbsent(t.getParentTask().getId(), k -> new ArrayList<>())
                        .add(t);
            }
        }

        // 3. Fetch all deadlines in ONE query
        List<CalendarEvent> allDeadlines = calendarEventRepository
                .findDeadlinesByProyectIdsOrStageIdsOrTaskIds(projectIds, stageIds, taskIds, EventType.DEADLINE);

        // 4. Build in‑memory sets for quick lookup
        Set<Integer> projectsWithDeadline = allDeadlines.stream()
                .filter(ce -> ce.getProject() != null && ce.getStage() == null && ce.getTask() == null)
                .map(ce -> ce.getProject().getId())
                .collect(Collectors.toSet());
        Set<Integer> stagesWithDeadline = allDeadlines.stream()
                .filter(ce -> ce.getStage() != null && ce.getTask() == null)
                .map(ce -> ce.getStage().getId())
                .collect(Collectors.toSet());
        Set<Integer> tasksWithDeadline = allDeadlines.stream()
                .filter(ce -> ce.getTask() != null)
                .map(ce -> ce.getTask().getId())
                .collect(Collectors.toSet());

        // 6. Map to DTOs (same as before, but now using the fetched entities)
        return projectsWithStagesAndTasks.stream()
                .map(project -> mapProjectToProjectSyncDTO(
                        project, projectsWithDeadline, tasksByStage, subtaskByParent,
                        stagesWithDeadline, tasksWithDeadline))
                .collect(Collectors.toList());
    }

    private List<CalendarEventDTO> buildCalendarEvents(Integer userId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // First day of the previous month
        Instant windowStart = today.minusMonths(1)
                .withDayOfMonth(1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        // Last day in 3 months
        Instant windowEnd = today.plusMonths(3)
                .with(TemporalAdjusters.lastDayOfMonth())
                .atTime(23, 59, 59)
                .toInstant(ZoneOffset.UTC);

        List<CalendarEvent> eventsInWindow = calendarEventRepository.findEventsInWindow(userId, windowStart, windowEnd);

        // Map entity to DTO
        return eventsInWindow.stream().map(event -> {
            // Linked entity logic
            String eventColour = event.getCustomColour();
            String eventLogo = null;
            String idLinkedEntity = null;

            // Color and logo logic (visual part)
            if (event.getProject() != null && event.getProject().getId() != null) {
                eventLogo = event.getProject().getLogoUrl();
            }
            if (eventColour == null && event.getStage() != null) {
                eventColour = event.getStage().getColour();
            }
            if (eventColour == null) {
                eventColour = "g2";
            }

            // Linked entity id logic
            if (event.getProject() != null && event.getProject().getId() != null) {
                idLinkedEntity = "p_" + event.getProject().getId();
            }
            if (event.getStage() != null && event.getStage().getId() != null) {
                idLinkedEntity = "f_" + event.getStage().getId();
            }
            if (event.getTask() != null && event.getTask().getId() != null) {
                idLinkedEntity = "t_" + event.getTask().getId();
            }

            return CalendarEventDTO.builder()
                    .id(event.getId())
                    .logo(eventLogo)
                    .linkedEntity(idLinkedEntity)
                    .name(event.getName())
                    .description(event.getDescription())
                    .initDateTime(event.getInitDateTime())
                    .endDateTime(event.getEndDateTime())
                    .colour(eventColour)
                    .eventType(event.getEventType())
                    .isActivateTracker(event.getIsActivateTracker())
                    .isCompleteDay(event.getIsCompleteDay())
                    .build();

        }).collect(Collectors.toList());
    }

    private List<HeaderInformation> buildHomeHeaders(Integer userId) {
        // 1. Tareas Pendientes
        Integer pendingTasks = taskRepository.countPendingTasks(userId);

        // 2. Minutos trabajados HOY
        Integer todayMinutesWrapper = preFetchedData.getTodayTotalMinutes();
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
        Integer totalHistoricalMinutes = preFetchedData.getGlobalTotalMinutes();
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
                                                       Set<Integer> projectsWithDeadline,
                                                       Map<Integer, List<Task>> tasksByStage,
                                                       Map<Integer, List<Task>> subtaskByParent,
                                                       Set<Integer> stagesWithDeadline,
                                                       Set<Integer> tasksWithDeadline) {
        List<StageSyncDTO> stageDTOs = project.getStages().stream()
                .map(stage -> mapStageToStageSyncDTO(
                        stage,
                        tasksByStage,
                        subtaskByParent,
                        stagesWithDeadline,
                        tasksWithDeadline))
                .collect(Collectors.toList());

        return ProjectSyncDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .logo(project.getLogoUrl())
                .description(project.getDescription())
                .deadline(project.getDeadline())
                .addToCalendar(projectsWithDeadline.contains(project.getId()))
                .type(project.getProjectType())
                .stages(stageDTOs)
                .build();
    }

    private StageSyncDTO mapStageToStageSyncDTO (Stage stage,
                                                 Map<Integer, List<Task>> tasksByStage,
                                                 Map<Integer, List<Task>> subtaskByParent,
                                                 Set<Integer> stagesWithDeadline,
                                                 Set<Integer> tasksWithDeadline) {

        List<Task> myTasks = tasksByStage.getOrDefault(stage.getId(), Collections.emptyList())
                .stream()
                .filter(task -> task.getParentTask() == null)
                .toList();

        String colour = stage.getColour();
        String logo = stage.getProject().getLogoUrl();

        List<TaskSyncDTO> taskDTOs = myTasks.stream()
                .map(task -> mapTaskToTaskSyncDTO(logo, colour, task, subtaskByParent, tasksWithDeadline))
                .collect(Collectors.toList());

        return StageSyncDTO.builder()
                .id(stage.getId())
                .name(stage.getName())
                .description(stage.getDescription())
                .colour(colour)
                .deadline(stage.getDeadline())
                .addToCalendar(stagesWithDeadline.contains(stage.getId()))
                .type(stage.getProject().getProjectType())
                .logo(logo)
                .tasks(taskDTOs)
                .build();
    }

    private TaskSyncDTO mapTaskToTaskSyncDTO(String logo, String colour, Task task,
                                             Map<Integer, List<Task>> subtaskByParent,
                                             Set<Integer> tasksWithDeadline) {

        List<Task> mySubtasks = subtaskByParent.getOrDefault(task.getId(), Collections.emptyList());

        List<SubtaskSyncDTO> subtaskSyncDTOS = mySubtasks.stream()
                .map(this::mapSubTaskToSubtaskSyncDTO)
                .collect(Collectors.toList());

        return TaskSyncDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .description(task.getDescription())
                .estimatedTime(task.getEstimatedTime())
                .timeUnit(task.getTimeUnit())
                .estimatedProfit(task.getEstimatedProfit())
                .deadline(task.getDeadline())
                .isCompleted(task.getIsCompleted())
                .addToCalendar(tasksWithDeadline.contains(task.getId()))
                .colour(colour)
                .logo(logo)
                .numberOfSubTask(subtaskSyncDTOS.size())
                .subtasks(subtaskSyncDTOS)
                .build();
    }

    private SubtaskSyncDTO mapSubTaskToSubtaskSyncDTO(Task task) {
        return SubtaskSyncDTO.builder()
                .id(task.getId())
                .name(task.getName())
                .isCompleted(task.getIsCompleted())
                .build();
    }
}