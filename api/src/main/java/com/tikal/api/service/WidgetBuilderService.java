package com.tikal.api.service;

import com.tikal.api.exception.BadRequestException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.sync.widgets.*;
import com.tikal.api.model.entity.*;
import com.tikal.api.repository.*;
import com.tikal.api.service.cache.PreFetchedDashboardData;
import com.tikal.api.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WidgetBuilderService {

    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final ProjectRepository projectRepository;
    private final StageRepository stageRepository;
    private final PreFetchedDashboardData preFetchedData;

    public WidgetData buildSingleWidget(String widgetId, User user, UserSettings settings) {
        return switch (widgetId) {
            case "weeklyProgressWidget" -> buildWeeklyProgress(user.getId());
            case "timeTrackerWidget" -> buildTimeTracker(user.getId());
            case "templeModeWidget" -> buildTempleModeWidget(user, settings);
            case "taskWidget" -> buildTaskWidget(user.getId(), settings);
            case "calendarWidget" -> buildCalendarWidgetData(settings);

            case "solarChartWidget" -> buildSolarChartBase(user.getId(), settings);
            case "concentrationHeatmapWidget" -> buildConcentrationHeatmap(user.getId(), settings);
            case "effectivenessChartWidget" -> buildEffectivenessChart(user.getId(), settings);
            case "timeGoalWidget" -> buildTimeGoalWidget(user.getId(), settings);
            case "comparisonWidget" -> buildComparisonWidget(user.getId(), settings);
            case "iaAdviceWidget" -> buildIaAdviceWidget(user.getId());
            default -> null;
        };
    }

    private WidgetData buildWeeklyProgress(Integer userId) {
        Map<LocalDate, Integer> minutesByDate = preFetchedData.getRollingWeekDailyMinutes();

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        // Subtitle generation
        String subtitle = DateUtils.formatDateRange(startDate, endDate, false);

        List<WeeklyProgressWidgetData.DailyProgress> daysList = new ArrayList<>();

        for (int i = 0; i <= 6; i++) {
            LocalDate currentDate = startDate.plusDays(i);

            Integer minutes = minutesByDate.getOrDefault(currentDate, 0);

            daysList.add(WeeklyProgressWidgetData.DailyProgress.builder()
                    .date(currentDate)
                    .dayLabel(WeeklyProgressWidgetData.getSpanishDayLabel(currentDate.getDayOfWeek()))
                    .minutesDedicated(minutes)
                    .build());
        }

        return WeeklyProgressWidgetData.builder()
                .subtitle(subtitle)
                .days(daysList)
                .build();
    }

    private WidgetData buildTimeTracker(Integer userId) {
        // CASE 1: There is an active time batch (Play or Pause)
        List<TimeLog> uncompletedLogs = timeLogRepository.findByUserIdAndIsCompletedFalse(userId);

        if (!uncompletedLogs.isEmpty()) {
            long accumulatedSeconds = 0;
            TimeLog runningLog = null;
            TimeLog referenceLog = uncompletedLogs.get(0);

            for (TimeLog log : uncompletedLogs) {
                if (log.getEndDateTime() != null) {
                    accumulatedSeconds += java.time.Duration.between(log.getInitDateTime(), log.getEndDateTime()).getSeconds();
                } else {
                    runningLog = log;
                }
            }

            return TimeTrackerWidgetData.builder()
                    .taskId(referenceLog.getTask() != null ? referenceLog.getTask().getId() : null)
                    .stageId(referenceLog.getStage() != null ? referenceLog.getStage().getId() : null)
                    .projectId(referenceLog.getProject() != null ? referenceLog.getProject().getId() : null)
                    .entityName(extractName(referenceLog))
                    .colour(extractColor(referenceLog))
                    .logo(extractLogo(referenceLog))
                    .initDateTime(runningLog != null ? runningLog.getInitDateTime() : null)
                    .accumulatedSeconds(accumulatedSeconds)
                    .build();
        }

        // CASE 2: Nothing is active. We use the most recent completed record as a suggestion
        Optional<TimeLog> optLastLog = timeLogRepository.findFirstByUser_IdAndTaskIsNotNullOrderByInitDateTimeDesc(userId);

        if (optLastLog.isPresent()) {
            TimeLog lastLog = optLastLog.get();
            return TimeTrackerWidgetData.builder()
                    .taskId(lastLog.getTask() != null ? lastLog.getTask().getId() : null)
                    .stageId(lastLog.getStage() != null ? lastLog.getStage().getId() : null)
                    .projectId(lastLog.getProject() != null ? lastLog.getProject().getId() : null)
                    .entityName(extractName(lastLog))
                    .colour(extractColor(lastLog))
                    .logo(extractLogo(lastLog))
                    .initDateTime(null) // Everything is null to tell the front that the tracker is stopped
                    .accumulatedSeconds(0L)
                    .build();
        }

        // CASE 3: A completely new user with no history. We are looking for any tasks they have
        Task fallbackTask = taskRepository.findFirstByAssignedUser_Id(userId);

        if (fallbackTask != null) {
            return TimeTrackerWidgetData.builder()
                    .taskId(fallbackTask.getId())
                    .entityName(fallbackTask.getName())
                    .colour(fallbackTask.getStage() != null ? fallbackTask.getStage().getColour() : null)
                    .logo(fallbackTask.getStage() != null && fallbackTask.getStage().getProject() != null ? fallbackTask.getStage().getProject().getLogoUrl() : "default")
                    .initDateTime(null)
                    .accumulatedSeconds(0L)
                    .build();
        }

        // CASE 4: Empty database
        return TimeTrackerWidgetData.builder()
                .entityName("Bienvenido a Tikal")
                .colour(null)
                .logo("IconCompass")
                .initDateTime(null)
                .accumulatedSeconds(0L)
                .build();
    }

    private String extractColor(TimeLog log) {
        if (log.getStage() != null) return log.getStage().getColour();
        if (log.getTask() != null && log.getTask().getStage() != null) return log.getTask().getStage().getColour();
        return "g2";
    }

    private String extractLogo(TimeLog log) {
        if (log.getProject() != null) return log.getProject().getLogoUrl();
        if (log.getStage() != null) return log.getStage().getProject().getLogoUrl();
        if (log.getTask() != null) return log.getTask().getStage().getProject().getLogoUrl();
        return null;
    }

    private String extractName(TimeLog log) {
        if (log.getTask() != null) return log.getTask().getName();
        if (log.getStage() != null) return log.getStage().getName();
        if (log.getProject() != null) return log.getProject().getName();
        return "Actividad Desconocida";
    }

    private WidgetData buildTempleModeWidget(User user, UserSettings settings) {
        RankList userRank = user.getCurrentRank();
        Integer defaultSession = settings.getFocusSessionMinutes() != null ? settings.getFocusSessionMinutes() : 25;

        double percentage = getPercentage(userRank);
        return TempleModeWidgetData.builder()
                .rank(user.getCurrentRank().getId())
                .rankTitle(user.getCurrentRank().getAwardedTitle())
                .rankPercentage(percentage)
                .colour(userRank.getColour())
                .logo(userRank.getBadgeImageUrl())
                .defaultFocusSessionMinutes(defaultSession)
                .build();
    }

    private double getPercentage(RankList userRank) {
        int globalTempleMinutes = preFetchedData.getGlobalTempleMinutes();
        double percentage = 0;
        if (userRank.getId() == 0) {
            percentage = 100;
        } else if (globalTempleMinutes > 0) {
            double templeHours = (double) globalTempleMinutes / 60;
            percentage = (templeHours - userRank.getRequiredHours()) /
                    (userRank.getNextHours() - userRank.getRequiredHours()) * 100;
            percentage = Math.clamp(percentage, 0.0, 100.0);
        }

        percentage = Math.round(percentage * 10.0) / 10.0;
        return percentage;
    }

    // ==========================================
    //      TASK WIDGET METHODS
    // ==========================================
    private TaskWidgetData buildTaskWidget(Integer userId, UserSettings settings) {
        TaskWidgetData.GroupingMode mode = TaskWidgetData.GroupingMode.BY_DEADLINE;
        //if (settings.getWidgetPreferences() != null && settings.getWidgetPreferences().getTaskGroupingMode() != null) {
        // mode = settings.getWidgetPreferences().getTaskGroupingMode(); // Ajusta según tu DTO
        //}

        // NOTE: To avoid overloading the system, we should ideally create a method that retrieves the
        // pending and completed tasks from the last 4 days.
        Instant daysAgo = LocalDate.now(ZoneOffset.UTC)
                .minusDays(4)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        List<Task> sampleTasks = taskRepository.findMainTasksPendingOrCompletedSince(userId, daysAgo);

        // Sort by: 1. Uncompleted, 2. Completed. Within each group, by deadline in ascending order.
        sampleTasks.sort(Comparator
                .comparing(Task::getIsCompleted)
                .thenComparing(Task::getDeadline, Comparator.nullsLast(Comparator.naturalOrder()))
        );

        List<Task> pendingTasks = sampleTasks.stream().filter(t -> !t.getIsCompleted()).collect(Collectors.toList());
        List<Task> completedTasks = sampleTasks.stream().filter(Task::getIsCompleted).toList();

        Map<Integer, Integer> subtasksCountMap = new HashMap<>();
        if (!pendingTasks.isEmpty()) {
            List<Integer> pendingIds = pendingTasks.stream().map(Task::getId).collect(Collectors.toList());
            List<Object[]> counts = taskRepository.countPendingSubtasksByParentIds(pendingIds);
            for (Object[] row : counts) {
                subtasksCountMap.put(((Number) row[0]).intValue(), ((Number) row[1]).intValue());
            }
        }

        double globalProgress = 0.0;
        if (!sampleTasks.isEmpty()) {
            // (Completadas recientes * 100) / (Pendientes + Completadas recientes)
            globalProgress = (completedTasks.size() * 100.0) / sampleTasks.size();
        }

        List<TaskWidgetData.TaskCard> cards;
        boolean hasMoreCards = false;

        if (mode == TaskWidgetData.GroupingMode.BY_DEADLINE) {
            cards = buildCardsByDeadline(sampleTasks, subtasksCountMap);
            if (cards.size() > 3) {
                hasMoreCards = true;
            }
        } else {
            cards = buildCardsByProject(pendingTasks, sampleTasks, subtasksCountMap);
            if (cards.size() > 3) {
                hasMoreCards = true;
                cards = cards.subList(0, 3);
            }
        }

        return TaskWidgetData.builder()
                .selectedGroupingMode(mode)
                .subtitle(Math.round(globalProgress * 10.0) / 10.0 + "%")
                .hasMoreCards(hasMoreCards)
                .cards(cards)
                .build();
    }

    private List<TaskWidgetData.TaskCard> buildCardsByDeadline(
            List<Task> pendingTasks,
            Map<Integer, Integer> subtasksCountMap) {

        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        Instant startOfToday = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startOfTomorrow = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant inThreeDays = startOfTomorrow.plus(3, ChronoUnit.DAYS);
        Instant inOneWeek = startOfTomorrow.plus(10, ChronoUnit.DAYS);

        String subtitlePrevious = "Antes del " + DateUtils.formatSingleDate(today);
        String subtitleToday = DateUtils.formatSingleDate(today);
        String subtitleThreeDays = DateUtils.formatDateRange(today.plusDays(1), today.plusDays(3), false);
        String subtitleOneWeek = DateUtils.formatDateRange(today.plusDays(4), today.plusDays(10), false);

        List<TaskWidgetData.TaskItem> previousTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> todayTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> threeDaysTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> nextWeekTasks = new ArrayList<>();

        int previousTasksCompleted = 0;
        int todayTasksCompleted = 0;
        int threeDaysTasksCompleted = 0;
        int nextWeekTasksCompleted = 0;

        for (Task task : pendingTasks) {
            if (task.getDeadline() == null) continue;

            TaskWidgetData.TaskItem item = mapToTaskItem(task, subtasksCountMap);
            Instant deadline = task.getDeadline();

            if (deadline.isBefore(startOfToday)) {
                previousTasks.add(item);
                if (task.getIsCompleted()) previousTasksCompleted++;

            } else if (deadline.isBefore(startOfTomorrow)) {
                todayTasks.add(item);
                if (task.getIsCompleted()) todayTasksCompleted++;

            } else if (deadline.isBefore(inThreeDays)) {
                threeDaysTasks.add(item);
                if (task.getIsCompleted()) threeDaysTasksCompleted++;

            } else if (deadline.isBefore(inOneWeek)) {
                nextWeekTasks.add(item);
                if (task.getIsCompleted()) nextWeekTasksCompleted++;
            }
        }

        return List.of(
                buildCard("Atrasadas", subtitlePrevious, previousTasks, previousTasksCompleted, previousTasks.size()),
                buildCard("Para hoy", subtitleToday, todayTasks, todayTasksCompleted, todayTasks.size()),
                buildCard("Próximos 3 días", subtitleThreeDays, threeDaysTasks, threeDaysTasksCompleted, threeDaysTasks.size()),
                buildCard("Próxima semana", subtitleOneWeek, nextWeekTasks, nextWeekTasksCompleted, nextWeekTasks.size())
        );
    }

    private List<TaskWidgetData.TaskCard> buildCardsByProject(
            List<Task> pendingTasks,
            List<Task> allUserTasks, // Necesitamos las completadas para calcular el 1/8
            Map<Integer, Integer> subtasksCountMap) {

        // Agrupamos las tareas pendientes por ID de Proyecto (asumiendo que Task -> Stage -> Project)
        Map<Integer, List<Task>> pendingByProject = pendingTasks.stream()
                .filter(t -> t.getStage() != null && t.getStage().getProject() != null)
                .collect(Collectors.groupingBy(t -> t.getStage().getProject().getId()));

        List<TaskWidgetData.TaskCard> projectCards = new ArrayList<>();

        for (Map.Entry<Integer, List<Task>> entry : pendingByProject.entrySet()) {
            Integer projectId = entry.getKey();
            List<Task> pTasks = entry.getValue();

            // Proyecto asociado a estas tareas
            Project project = pTasks.get(0).getStage().getProject();

            // Calculamos el total de tareas de este proyecto (pendientes + completadas) para el 1/8
            long totalProjectTasks = allUserTasks.stream()
                    .filter(t -> t.getStage() != null && t.getStage().getProject() != null && t.getStage().getProject().getId().equals(projectId))
                    .count();

            long completedProjectTasks = totalProjectTasks - pTasks.size();

            List<TaskWidgetData.TaskItem> items = pTasks.stream()
                    .map(t -> mapToTaskItem(t, subtasksCountMap))
                    .collect(Collectors.toList());

            projectCards.add(buildCard(
                    "Tareas de " + project.getName(),
                    null,
                    items,
                    (int) completedProjectTasks,
                    (int) totalProjectTasks
            ));
        }

        // The projects with more task are more important
        projectCards.sort((c1, c2) -> Integer.compare(c2.getTasks().size(), c1.getTasks().size()));

        return projectCards;
    }

    private TaskWidgetData.TaskCard buildCard(String title, String subtitle, List<TaskWidgetData.TaskItem> tasks, int completed, int total) {
        return TaskWidgetData.TaskCard.builder()
                .title(title)
                .subtitle(subtitle)
                .completedTasksCount(completed)
                .totalTasksCount(total)
                .tasks(tasks)
                .build();
    }

    private TaskWidgetData.TaskItem mapToTaskItem(Task task, Map<Integer, Integer> subtasksCountMap) {
        Integer subtasks = subtasksCountMap.get(task.getId());

        String color = task.getStage() != null ? task.getStage().getColour() : "#000000";
        String icon = task.getStage() != null && task.getStage().getProject() != null ? task.getStage().getProject().getLogoUrl() : "defaultIcon";

        return TaskWidgetData.TaskItem.builder()
                .taskId(task.getId())
                .name(task.getName())
                .logo(icon)
                .color(color)
                .subtasksCount(subtasks != null && subtasks > 0 ? subtasks : null)
                .isCompleted(task.getIsCompleted())
                .build();
    }
    // ==========================================

    private WidgetData buildCalendarWidgetData(UserSettings settings) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;

        if (settings.getFirstDayOfWeek() != null && settings.getFirstDayOfWeek().name().equalsIgnoreCase("DOMINGO")) {
            startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        } else {
            startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }

        LocalDate endDate = startDate.plusDays(6);

        LocalTime startHour = LocalTime.of(8, 0);  // Changes required because it depends on the widget configuration

        Boolean showWeekends = true;

        // Si tienes esta preferencia en layouts/metadata
        //if (settings.getWidgetPreferences() != null && settings.getWidgetPreferences().getShowWeekends() != null) {
        //    showWeekends = settings.getWidgetPreferences().getShowWeekends();
        //}

        return CalendarWidgetData.builder()
                .startDate(startDate)
                .endDate(endDate)
                .startHour(startHour)
                .showWeekends(showWeekends)
                .build();
    }


    // ==========================================
    //      SOLAR CHART METHODS
    // ==========================================

    // Base layer (Projects)
    private WidgetData buildSolarChartBase(Integer userId, UserSettings settings) {
        SolarChartWidgetData.TimeRangeFilter filter = SolarChartWidgetData.TimeRangeFilter.GLOBAL;

        Instant[] dateRange = resolveDateRange(filter, null);
        List<Object[]> dbResults = timeLogRepository.getSolarChartProjectData(userId, dateRange[0], dateRange[1]);

        return assembleSolarChartWidget("PROJECT", null, filter, null, dbResults);
    }

    // Sublayer (Stages)
    public SolarChartWidgetData buildSolarChartStages(Integer projectId, String filterParam, String customStart, String customEnd) {
        SolarChartWidgetData.TimeRangeFilter filter;
        try {
            filter = SolarChartWidgetData.TimeRangeFilter.valueOf(filterParam);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid filterParam: " + filterParam + ". Allowed values: DAILY, WEEKLY, MONTHLY, GLOBAL, CUSTOM");
        }

        LocalDate startDate = null;
        LocalDate endDate = null;
        Instant[] dateRange;

        if (filter == SolarChartWidgetData.TimeRangeFilter.CUSTOM) {
            // Validate that custom dates are provided
            if (customStart == null || customStart.isEmpty() || customEnd == null || customEnd.isEmpty()) {
                throw new BadRequestException("Custom date range requires both customStart and customEnd parameters");
            }

            // Parse and validate custom dates
            try {
                startDate = LocalDate.parse(customStart);
                endDate = LocalDate.parse(customEnd);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Invalid date format. Expected format: YYYY-MM-DD. Provided: start=" + customStart + ", end=" + customEnd);
            }

            // Validate that start date is not after end date
            if (startDate.isAfter(endDate)) {
                throw new BadRequestException("Start date cannot be after end date: start=" + startDate + ", end=" + endDate);
            }

            dateRange = new Instant[]{
                    startDate.atStartOfDay().toInstant(ZoneOffset.UTC),
                    endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC)
            };
        } else {
            // For non-CUSTOM filters, ignore customStart/customEnd if provided (or you could log a warning)
            dateRange = resolveDateRange(filter, null);
        }

        // Create customDateRange only for CUSTOM filter
        SolarChartWidgetData.CustomDateRange customDateRange = (filter == SolarChartWidgetData.TimeRangeFilter.CUSTOM && startDate != null && endDate != null)
                ? new SolarChartWidgetData.CustomDateRange(startDate, endDate)
                : null;

        List<Object[]> dbResults = timeLogRepository.getSolarChartStageData(projectId, dateRange[0], dateRange[1]);
        return assembleSolarChartWidget("STAGE", projectId, filter, customDateRange, dbResults);
    }

    // Sublayer (tasks)
    public SolarChartWidgetData buildSolarChartTasks(Integer stageId, String filterParam, String customStart, String customEnd) {
        SolarChartWidgetData.TimeRangeFilter filter;
        try {
            filter = SolarChartWidgetData.TimeRangeFilter.valueOf(filterParam);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid filterParam: " + filterParam + ". Allowed values: DAILY, WEEKLY, MONTHLY, GLOBAL, CUSTOM");
        }

        LocalDate startDate = null;
        LocalDate endDate = null;
        Instant[] dateRange;

        if (filter == SolarChartWidgetData.TimeRangeFilter.CUSTOM) {
            // Validate that custom dates are provided
            if (customStart == null || customStart.isEmpty() || customEnd == null || customEnd.isEmpty()) {
                throw new BadRequestException("Custom date range requires both customStart and customEnd parameters");
            }

            // Parse and validate custom dates
            try {
                startDate = LocalDate.parse(customStart);
                endDate = LocalDate.parse(customEnd);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Invalid date format. Expected format: YYYY-MM-DD. Provided: start=" + customStart + ", end=" + customEnd);
            }

            // Validate that start date is not after end date
            if (startDate.isAfter(endDate)) {
                throw new BadRequestException("Start date cannot be after end date: start=" + startDate + ", end=" + endDate);
            }

            dateRange = new Instant[]{
                    startDate.atStartOfDay().toInstant(ZoneOffset.UTC),
                    endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC)
            };
        } else {
            // For non-CUSTOM filters, ignore customStart/customEnd if provided (or you could log a warning)
            dateRange = resolveDateRange(filter, null);
        }

        // Create customDateRange only for CUSTOM filter
        SolarChartWidgetData.CustomDateRange customDateRange = (filter == SolarChartWidgetData.TimeRangeFilter.CUSTOM && startDate != null && endDate != null)
                ? new SolarChartWidgetData.CustomDateRange(startDate, endDate)
                : null;

        List<Object[]> dbResults = timeLogRepository.getSolarChartTaskData(stageId, dateRange[0], dateRange[1]);
        return assembleSolarChartWidget("TASK", stageId, filter, customDateRange, dbResults);
    }

    private SolarChartWidgetData assembleSolarChartWidget(
            String layer,
            Integer parentId,
            SolarChartWidgetData.TimeRangeFilter filter,
            SolarChartWidgetData.CustomDateRange customRange,
            List<Object[]> dbResults) {

        int grandTotalMinutes = 0;
        String mostRecurringName = "Sin datos";

        // 1. Calcular el total de minutos de todos los trozos para hacer el 100%
        for (Object[] row : dbResults) {
            if (row[3] != null) {
                grandTotalMinutes += ((Number) row[3]).intValue();
            }
        }

        List<SolarChartWidgetData.SolarChartSlice> slices = new ArrayList<>();

        // 2. Recorrer los resultados (Ya vienen ordenados de mayor a menor por MySQL)
        for (int i = 0; i < dbResults.size(); i++) {
            Object[] row = dbResults.get(i);

            Integer id = ((Number) row[0]).intValue();
            String name = (String) row[1];
            String logoOrColor = (String) row[2];
            int minutes = row[3] != null ? ((Number) row[3]).intValue() : 0;

            // El ganador indiscutible es el primero de la lista (i == 0)
            if (i == 0 && minutes > 0) {
                mostRecurringName = name;
            }

            // Calculamos el porcentaje (ej: 45.2%)
            double percentage = 0.0;
            if (grandTotalMinutes > 0) {
                percentage = (minutes * 100.0) / grandTotalMinutes;
                percentage = Math.round(percentage * 10.0) / 10.0;
            }

            String timeDedicated = DateUtils.formatMinutesForSolarChart(minutes);

            slices.add(SolarChartWidgetData.SolarChartSlice.builder()
                    .sliceId(id)
                    .sliceName(name)
                    .logoOrColour(logoOrColor)
                    .timeDedicated(timeDedicated)
                    .percentage(percentage)
                    .build());
        }

        String logo = null;
        String colour = null;

        if (layer.trim().equalsIgnoreCase("STAGE")) {
            Project project = projectRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("El proyecto no existe"));
            logo = project.getLogoUrl();
        } else if (layer.trim().equalsIgnoreCase("TASK")) {
            Stage stage = stageRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("La fase solicitada no existe"));
            colour = stage.getColour();
            logo = stage.getProject().getLogoUrl();
        }

        return SolarChartWidgetData.builder()
                .currentLayer(layer)
                .parentId(parentId)
                .selectedFilter(filter)
                .customDateRange(customRange)
                .mostRecurringListName(mostRecurringName)
                .slices(slices)
                .logo(logo)
                .colour(colour)
                .build();
    }

    private Instant[] resolveDateRange(SolarChartWidgetData.TimeRangeFilter filter, SolarChartWidgetData.CustomDateRange customRange) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant now = Instant.now();

        Instant startDate;
        Instant endDate = now; // Por defecto, el límite superior es el instante actual

        switch (filter) {
            case DAILY -> {
                startDate = today.atStartOfDay().toInstant(ZoneOffset.UTC);
            }
            case WEEKLY -> {
                startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                        .atStartOfDay().toInstant(ZoneOffset.UTC);
            }
            case MONTHLY -> {
                startDate = today.withDayOfMonth(1)
                        .atStartOfDay().toInstant(ZoneOffset.UTC);
            }
            case GLOBAL -> {
                // Parseo directo a Instant (Zulu time)
                startDate = Instant.parse("2010-01-01T00:00:00Z");
            }
            case CUSTOM -> {
                if (customRange != null && customRange.getStartDate() != null && customRange.getEndDate() != null) {
                    startDate = customRange.getStartDate().atStartOfDay().toInstant(ZoneOffset.UTC);
                    endDate = customRange.getEndDate().atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
                } else {
                    startDate = today.atStartOfDay().toInstant(ZoneOffset.UTC);
                }
            }
            default -> startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .atStartOfDay().toInstant(ZoneOffset.UTC);
        }

        return new Instant[]{startDate, endDate};
    }
    // ==========================================

    // ==========================================
    // CONCENTRATION HEATMAP
    // ==========================================
    private ConcentrationHeatmapWidgetData buildConcentrationHeatmap(Integer userId, UserSettings settings) {
        YearMonth currentMonth = YearMonth.now();
        int year = currentMonth.getYear();
        int month = currentMonth.getMonthValue();

       Map<LocalDate, Integer> dailyMinutes = preFetchedData.getMonthDailyMinutes();
        if (dailyMinutes == null) {
            dailyMinutes = Collections.emptyMap();
        }

        List<ConcentrationHeatmapWidgetData.HeatmapDay> daysList = new ArrayList<>();
        int lengthOfMonth = currentMonth.lengthOfMonth();

        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate currentDate = currentMonth.atDay(day);

            Integer minutes = dailyMinutes.getOrDefault(currentDate, 0);

            daysList.add(ConcentrationHeatmapWidgetData.HeatmapDay.builder()
                    .date(currentDate)
                    .dayOfMonth(day)
                    .minutesDedicated(minutes)
                    .intensity(calculateHeatmapIntensity(minutes))
                    .build());
        }

        return ConcentrationHeatmapWidgetData.builder()
                .year(year)
                .month(month)
                .days(daysList)
                .build();
    }

    private ConcentrationHeatmapWidgetData.IntensityLevel calculateHeatmapIntensity(Integer minutes) {
        if (minutes == null || minutes <= 0) {
            return ConcentrationHeatmapWidgetData.IntensityLevel.NONE;
        }

        if (minutes < 120) {
            return ConcentrationHeatmapWidgetData.IntensityLevel.LOW;    // Less than 2 hour
        } else if (minutes < 240) {
            return ConcentrationHeatmapWidgetData.IntensityLevel.MEDIUM; // Between 2 and 4 hours
        } else if (minutes < 480) {
            return ConcentrationHeatmapWidgetData.IntensityLevel.HIGH;   // Between 4 and 8 hours
        } else {
            return ConcentrationHeatmapWidgetData.IntensityLevel.MAXIMUM; // More than 8 hours
        }
    }
    // ==========================================

    // ======================================================
    // EFFECTIVENESS CHART (Concentration / Profitability)
    // ======================================================

    // Default method for the initial JSON (WorkspaceSyncDTO)
    private EffectivenessChartWidgetData buildEffectivenessChart(Integer userId, UserSettings settings) {
        return buildEffectivenessChartDynamic(userId,
                EffectivenessChartWidgetData.MetricType.CONCENTRATION,
                EffectivenessChartWidgetData.TimeRange.WEEKLY,
                settings);
    }

    // A dynamic method for your controller to call when the user changes the chart type
    public EffectivenessChartWidgetData buildEffectivenessChartDynamic(
            Integer userId,
            EffectivenessChartWidgetData.MetricType metric,
            EffectivenessChartWidgetData.TimeRange range,
            UserSettings settings) {

        LocalDate startDate;
        LocalDate endDate;

        if (range == EffectivenessChartWidgetData.TimeRange.WEEKLY) {
            startDate = PreFetchedDashboardData.getWeekStart(settings).toLocalDate();
            endDate = startDate.plusDays(6);
        } else {
            YearMonth currentMonth = YearMonth.now();
            startDate = currentMonth.atDay(1);
            endDate = currentMonth.atEndOfMonth();
        }

        Instant startDateTime = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endDateTime = endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        // Data obtention
        Map<LocalDate, Double> percentMap = new HashMap<>();

        if (metric == EffectivenessChartWidgetData.MetricType.CONCENTRATION) {
            Map<LocalDate, Double> weeklyConc = preFetchedData.getWeekConcentrationPercentage();
            if (weeklyConc != null) {
                percentMap = weeklyConc;
            } else {
                // fallback to DB (should not happen on initial load)
                List<Object[]> dbResults = timeLogRepository.getDailyConcentrationPercentage(userId, startDateTime, endDateTime);
                percentMap = mapConcentrationResults(dbResults);
            }
        } else {

            // PROFITABILITY: Best day logic "Mejor Día"
            List<Object[]> dbResults = timeLogRepository.getDailyProfitability(userId, startDateTime, endDateTime);
            Map<LocalDate, Double> rawProfitMap = new HashMap<>();
            double maxProfit = 0.0;

            // Save the values (€/min) and searching the maximum
            for (Object[] row : dbResults) {
                LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                Double profitPerMin = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                rawProfitMap.put(date, profitPerMin);

                if (profitPerMin > maxProfit) {
                    maxProfit = profitPerMin;
                }
            }

            // Calculation of the percentage in base of the maximum
            for (Map.Entry<LocalDate, Double> entry : rawProfitMap.entrySet()) {
                double pct = (maxProfit > 0) ? (entry.getValue() / maxProfit) * 100.0 : 0.0;
                percentMap.put(entry.getKey(), pct);
            }
        }

        List<EffectivenessChartWidgetData.ChartPoint> dataPoints = new ArrayList<>();

        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            Double value = percentMap.getOrDefault(d, 0.0);

            value = Math.round(value * 10.0) / 10.0;

            String label = formatChartLabel(d, range);

            dataPoints.add(EffectivenessChartWidgetData.ChartPoint.builder()
                    .label(label)
                    .percentage(value)
                    .build());
        }

        return EffectivenessChartWidgetData.builder()
                .selectedMetric(metric)
                .selectedTimeRange(range)
                .dataPoints(dataPoints)
                .build();
    }

    private Map<LocalDate, Double> mapConcentrationResults(List<Object[]> dbResults) {
        Map<LocalDate, Double> map = new HashMap<>();
        for (Object[] row : dbResults) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            Double pct = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            map.put(date, pct);
        }
        return map;
    }

    private String formatChartLabel(LocalDate date, EffectivenessChartWidgetData.TimeRange range) {
        if (range == EffectivenessChartWidgetData.TimeRange.WEEKLY) {
            // Returns the day initial (L, M, X, J, V, S, D)
            return switch (date.getDayOfWeek()) {
                case MONDAY -> "L";
                case TUESDAY -> "M";
                case WEDNESDAY -> "X";
                case THURSDAY -> "J";
                case FRIDAY -> "V";
                case SATURDAY -> "S";
                case SUNDAY -> "D";
            };
        } else {
            // For the month it returns the number of the day (1, 2, 3... 31)
            return String.valueOf(date.getDayOfMonth());
        }
    }
    // ==========================================

    // ==========================================
    // TIME GOAL WIDGET
    // ==========================================
    public WidgetData buildTimeGoalWidget(Integer userId, UserSettings settings) {
        int currentMinutes = preFetchedData.getCurrentWeekTotalMinutes();
        String currentMinutesSubtitle = DateUtils.formatMinutes(currentMinutes);
        int goalHours = settings.getHoursGoal() != null ? settings.getHoursGoal() : 40;
        int goalMinutes = goalHours * 60;
        double completionPercentage = 0.0;
        if (goalMinutes > 0) {
            completionPercentage = ((double) currentMinutes / goalMinutes) * 100.0;
        }

        if (completionPercentage > 100) {
            completionPercentage = 100;
        }
        completionPercentage = Math.round(completionPercentage * 10.0) / 10.0;

        // Dynamic subtitle construction
        LocalDate startDate = PreFetchedDashboardData.getWeekStart(settings).toLocalDate();
        LocalDate endDate = startDate.plusDays(6);

        String subtitle = DateUtils.formatDateRange(startDate, endDate, true);

        return TimeGoalWidgetData.builder()
                .currentMinutes(currentMinutesSubtitle)
                .goalMinutes(goalMinutes)
                .completionPercentage(completionPercentage)
                .startDate(startDate)
                .endDate(endDate)
                .subtitle(subtitle)
                .build();
    }
    // ==========================================

    // ==========================================
    // COMPARISON WIDGET
    // ==========================================
    private ComparisonWidgetData buildComparisonWidget(Integer userId, UserSettings settings) {
        return buildComparisonWidgetDynamic(userId, ComparisonWidgetData.TimeRangeFilter.THIS_WEEK, settings);
    }

    // Dynamic method for the controller
    public ComparisonWidgetData buildComparisonWidgetDynamic(
            Integer userId,
            ComparisonWidgetData.TimeRangeFilter filter,
            UserSettings settings) {

        // 1. Calculation of the time limits (Actual vs Previous)
        Instant[] periods = calculateComparisonPeriods(filter, settings);
        Instant currentStart = periods[0];
        Instant currentEnd = periods[1];
        Instant previousStart = periods[2];
        Instant previousEnd = periods[3];

        LocalDateTime uiStart = LocalDateTime.ofInstant(currentStart, ZoneOffset.UTC);
        LocalDateTime uiEnd = LocalDateTime.ofInstant(currentEnd, ZoneOffset.UTC);

        String format = DateUtils.formatDateRangeMinimal(uiStart, uiEnd);
        String week = format.split(" ")[0];
        String month = format.split(" ")[1];

        // 2. Extract the ACTUAL data
        int currTotalMins, currTempleMins, currTasks;
        int prevTotalMins, prevTempleMins, prevTasks;

        if (filter == ComparisonWidgetData.TimeRangeFilter.THIS_WEEK) {
            currTotalMins = preFetchedData.getCurrentWeekTotalMinutes();
            currTempleMins = preFetchedData.getCurrentWeekTempleMinutes();

            prevTotalMins = preFetchedData.getPrevWeekTotalMinutes();
            prevTempleMins = preFetchedData.getPrevWeekTempleMinutes();
        } else { // THIS_MONTH
            currTotalMins = preFetchedData.getCurrentMonthTotalMinutes();
            currTempleMins = preFetchedData.getCurrentMonthTempleMinutes();

            prevTotalMins = preFetchedData.getPrevMonthTotalMinutes();
            prevTempleMins = preFetchedData.getPrevMonthTempleMinutes();
        }
        currTasks = getSafeInt(taskRepository.countCompletedTasksBetweenDates(userId, currentStart, currentEnd));
        prevTasks = getSafeInt(taskRepository.countCompletedTasksBetweenDates(userId, previousStart, previousEnd));

        // 4. Metrics constructor
        List<ComparisonWidgetData.ComparisonMetric> metrics = new ArrayList<>();
        metrics.add(buildTimeMetric("TOTAL_HOURS", "Horas registradas", currTotalMins, prevTotalMins));
        metrics.add(buildTimeMetric("TEMPLE_HOURS", "Modo Templo", currTempleMins, prevTempleMins));
        metrics.add(buildNumericMetric("COMPLETED_TASKS", "Tareas completadas", currTasks, prevTasks));

        return ComparisonWidgetData.builder()
                .week(week)
                .month(month)
                .selectedFilter(filter)
                .metrics(metrics)
                .build();
    }

    // --- Helpers de Fechas ---
    private Instant[] calculateComparisonPeriods(ComparisonWidgetData.TimeRangeFilter filter, UserSettings settings) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        LocalDate currentStartLocal;
        LocalDate currentEndLocal;
        LocalDate previousStartLocal;
        LocalDate previousEndLocal;

        if (filter == ComparisonWidgetData.TimeRangeFilter.THIS_WEEK) {
            // Actual Week
            DayOfWeek firstDay = (settings != null && settings.getFirstDayOfWeek() != null && settings.getFirstDayOfWeek().name().equalsIgnoreCase("DOMINGO"))
                    ? DayOfWeek.SUNDAY : DayOfWeek.MONDAY;

            currentStartLocal = today.with(TemporalAdjusters.previousOrSame(firstDay));
            currentEndLocal = currentStartLocal.plusDays(6);

            // Previous week
            previousStartLocal = currentStartLocal.minusWeeks(1);
            previousEndLocal = currentEndLocal.minusWeeks(1);

        } else {
            // Actual month
            currentStartLocal = today.withDayOfMonth(1);
            currentEndLocal = today.with(TemporalAdjusters.lastDayOfMonth());

            // Previous month
            previousStartLocal = currentStartLocal.minusMonths(1);
            previousEndLocal = previousStartLocal.with(TemporalAdjusters.lastDayOfMonth());
        }

        Instant currentStart = currentStartLocal.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant currentEnd = currentEndLocal.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        Instant previousStart = previousStartLocal.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant previousEnd = previousEndLocal.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        return new Instant[]{currentStart, currentEnd, previousStart, previousEnd};
    }

    // --- Metrics constructor ---
    private ComparisonWidgetData.ComparisonMetric buildTimeMetric(String id, String label, int currMins, int prevMins) {
        int diffMins = currMins - prevMins;
        ComparisonWidgetData.Trend trend = determineTrend(diffMins);

        String displayValue = DateUtils.formatMinutes(diffMins);

        return ComparisonWidgetData.ComparisonMetric.builder()
                .id(id)
                .label(label)
                .displayValue(displayValue)
                .direction(trend)
                .build();
    }

    private ComparisonWidgetData.ComparisonMetric buildNumericMetric(String id, String label, int currNum, int prevNum) {
        int diff = currNum - prevNum;
        ComparisonWidgetData.Trend trend = determineTrend(diff);

        String displayValue = String.valueOf(diff);

        return ComparisonWidgetData.ComparisonMetric.builder()
                .id(id)
                .label(label)
                .displayValue(displayValue)
                .direction(trend)
                .build();
    }

    private ComparisonWidgetData.Trend determineTrend(int difference) {
        if (difference > 0) return ComparisonWidgetData.Trend.POSITIVE;
        if (difference < 0) return ComparisonWidgetData.Trend.NEGATIVE;
        return ComparisonWidgetData.Trend.NEUTRAL;
    }

    private int getSafeInt(Integer value) {
        return value != null ? value : 0;
    }
    // ==========================================

    private WidgetData buildIaAdviceWidget(Integer userId) {
        return AiAdviceWidgetData.builder().build();
    }

    // ==========================================
    //      AUXILIARY METHODS
    // ==========================================
    private String formatCleanDate(LocalDate date, DateTimeFormatter formatter) {
        return date.format(formatter).toLowerCase().replace(".", "");
    }
}
