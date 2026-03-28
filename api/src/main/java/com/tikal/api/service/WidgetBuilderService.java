package com.tikal.api.service;

import com.tikal.api.model.dto.sync.widgets.*;
import com.tikal.api.model.entity.Project;
import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.TimeLog;
import com.tikal.api.model.entity.UserSettings;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TimeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WidgetBuilderService {

    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;

    public WidgetData buildSingleWidget(String widgetId, Integer userId, UserSettings settings) {
        return switch (widgetId) {
            case "weeklyProgressWidget" -> buildWeeklyProgress(userId, settings);
            case "timeTrackerWidget" -> buildTimeTracker(userId);
            case "templeModeWidget" -> buildTempleModeWidget(userId, settings);
            case "taskWidget" -> buildTaskWidget(userId, settings);
            case "calendarWidget" -> buildCalendarWidgetData(settings);

            case "solarChartWidget" -> buildSolarChartBase(userId, settings);
            case "concentrationHeatmapWidget" -> buildConcentrationHeatmap(userId, settings);
            case "effectivenessChartWidget" -> buildEffectivenessChart(userId, settings);
            case "timeGoalWidget" -> buildTimeGoalWidget(userId, settings);
            case "comparisonWidget" -> buildComparisonWidget(userId, settings);
            case "iaAdviceWidget" -> buildIaAdviceWidget(userId);
            default -> null;
        };
    }

    private WidgetData buildWeeklyProgress(Integer userId, UserSettings settings) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Object[]> dbResults = timeLogRepository.getDailyTotalMinutesBetweenDates(userId, startDateTime, endDateTime);

        Map<LocalDate, Integer> minutesByDate = new HashMap<>();
        for (Object[] row : dbResults) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            Integer minutes = ((Number) row[1]).intValue();
            minutesByDate.put(sqlDate.toLocalDate(), minutes);
        }

        List<WeeklyProgressWidgetData.DailyProgress> daysList = new ArrayList<>();
        int maxMinutes = 0;

        for (int i = 0; i <= 6; i++) {
            LocalDate currentDate = startDate.plusDays(i);

            Integer minutes = minutesByDate.getOrDefault(currentDate, 0);

            if (minutes > maxMinutes) {
                maxMinutes = minutes;
            }

            daysList.add(WeeklyProgressWidgetData.DailyProgress.builder()
                    .date(currentDate)
                    .dayLabel(WeeklyProgressWidgetData.getSpanishDayLabel(currentDate.getDayOfWeek()))
                    .minutesDedicated(minutes)
                    .build());
        }

        return WeeklyProgressWidgetData.builder()
                .startDate(startDate)
                .endDate(endDate)
                .maxMinutesRegistered(maxMinutes)
                .days(daysList)
                .build();
    }

    private WidgetData buildTimeTracker(Integer userId) {
        Task targetTask = null;
        TimeLog lastLog = timeLogRepository.findFirstByUser_IdAndTaskIsNotNullOrderByInitDateTimeDesc(userId);

        if (lastLog != null) {
            targetTask = lastLog.getTask();
        } else {
            targetTask = taskRepository.findFirstByAssignedUser_Id(userId);
        }

        if (targetTask == null) {
            return TimeTrackerWidgetData.builder()
                    .taskId(0)
                    .taskName("Registra tu primera tarea")
                    .projectOrPhaseName("Bienvenido a Tikal")
                    .accumulatedSeconds(0)
                    .build();
        }

        String parentName = "";
        String parentColor = "#FFFFFF";
        String projectLogo = null;

        if (targetTask.getStage() != null) {
            parentName = targetTask.getStage().getName();
            parentColor = targetTask.getStage().getColour();

            if (targetTask.getStage().getProject() != null) {
                projectLogo = targetTask.getStage().getProject().getLogoUrl();
            }
        }

        int totalMinutes = targetTask.getTotalLoggedMinutes() != null ? targetTask.getTotalLoggedMinutes() : 0;
        Integer accumulatedSeconds = totalMinutes * 60;

        return TimeTrackerWidgetData.builder()
                .taskId(targetTask.getId())
                .taskName(targetTask.getName())
                .projectOrPhaseName(parentName)
                .parentColor(parentColor)
                .projectLogoIcon(projectLogo)
                .accumulatedSeconds(accumulatedSeconds)
                .build();
    }

    private WidgetData buildTempleModeWidget(Integer userId, UserSettings settings) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        Integer todayMinutes = timeLogRepository.sumTempleMinutesToday(userId, startOfDay, endOfDay);
        Integer defaultSession = settings.getFocusSessionMinutes() != null ? settings.getFocusSessionMinutes() : 25;

        return TempleModeWidgetData.builder()
                .todayFocusedMinutes(todayMinutes != null ? todayMinutes : 0)
                .defaultFocusSessionMinutes(defaultSession)
                .build();
    }

    // ==========================================
    //      TASK WIDGET METHODS
    // ==========================================
    private TaskWidgetData buildTaskWidget(Integer userId, UserSettings settings) {
        TaskWidgetData.GroupingMode mode = TaskWidgetData.GroupingMode.BY_DEADLINE;
        //if (settings.getWidgetPreferences() != null && settings.getWidgetPreferences().getTaskGroupingMode() != null) {
        // mode = settings.getWidgetPreferences().getTaskGroupingMode(); // Ajusta según tu DTO
        //}

        // NOTA: Para no sobrecargar, idealmente creamos un método que traiga las pendientes y las completadas en los últimos 30 días.
        // Aquí usaré findByAssignedUser_Id como ejemplo, pero deberías filtrarlo en el Repository.
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        List<Task> sampleTasks = taskRepository.findMainTasksPendingOrCompletedSince(userId, twoDaysAgo);

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
            cards = buildCardsByDeadline(pendingTasks, subtasksCountMap);
        } else {
            cards = buildCardsByProject(pendingTasks, sampleTasks, subtasksCountMap);
            if (cards.size() > 3) {
                hasMoreCards = true;
                cards = cards.subList(0, 3);
            }
        }

        return TaskWidgetData.builder()
                .selectedGroupingMode(mode)
                .globalProgressPercentage(Math.round(globalProgress * 10.0) / 10.0)
                .hasMoreCards(hasMoreCards)
                .cards(cards)
                .build();
    }

    private List<TaskWidgetData.TaskCard> buildCardsByDeadline(
            List<Task> pendingTasks,
            Map<Integer, Integer> subtasksCountMap) {

        LocalDate today = LocalDate.now();
        LocalDateTime endOfToday = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime inThreeDays = endOfToday.plusDays(3);
        LocalDateTime inOneWeek = endOfToday.plusDays(10);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM", new Locale("es", "ES"));

        String subtitleToday = formatCleanDate(today, formatter);
        String subtitleThreeDays = formatCleanDate(today.plusDays(1), formatter) + " - " +
                formatCleanDate(today.plusDays(3), formatter);;
        String subtitleOneWeek = formatCleanDate(today.plusDays(4), formatter) + " - " +
                formatCleanDate(today.plusDays(10), formatter);;

        List<TaskWidgetData.TaskItem> todayTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> threeDaysTasks = new ArrayList<>();
        List<TaskWidgetData.TaskItem> nextWeekTasks = new ArrayList<>();

        for (Task task : pendingTasks) {
            if (task.getDeadline() == null) continue;

            TaskWidgetData.TaskItem item = mapToTaskItem(task, subtasksCountMap);

            if (task.getDeadline().isBefore(endOfToday) || task.getDeadline().isEqual(endOfToday)) {
                todayTasks.add(item);
            } else if (task.getDeadline().isBefore(inThreeDays)) {
                threeDaysTasks.add(item);
            } else if (task.getDeadline().isBefore(inOneWeek)) {
                nextWeekTasks.add(item);
            }
        }

        return List.of(
                buildCard("Para hoy y atrasadas", subtitleToday, todayTasks, todayTasks.size(), todayTasks.size()),
                buildCard("Próximos 3 días", subtitleThreeDays, threeDaysTasks, threeDaysTasks.size(), threeDaysTasks.size()),
                buildCard("Próxima semana", subtitleOneWeek, nextWeekTasks, nextWeekTasks.size(), nextWeekTasks.size())
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
                    project.getName(),
                    "Proyecto",
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
                .iconIdentifier(icon)
                .colorHex(color)
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

        LocalTime startHour = LocalTime.of(8, 0);

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

        LocalDateTime[] dateRange = resolveDateRange(filter, null);
        List<Object[]> dbResults = timeLogRepository.getSolarChartProjectData(userId, dateRange[0], dateRange[1]);

        return assembleSolarChartWidget("PROJECT", null, filter, null, dbResults);
    }

    // Sublayer (Stages)
    public SolarChartWidgetData buildSolarChartStages(Integer projectId, String filterParam, String customStart, String customEnd) {
        SolarChartWidgetData.TimeRangeFilter filter = SolarChartWidgetData.TimeRangeFilter.valueOf(filterParam);
        // Aquí deberías parsear customStart y customEnd si el filtro es CUSTOM
        LocalDateTime[] dateRange = resolveDateRange(filter, null);

        List<Object[]> dbResults = timeLogRepository.getSolarChartStageData(projectId, dateRange[0], dateRange[1]);
        return assembleSolarChartWidget("STAGE", projectId, filter, null, dbResults);
    }

    // Sublayer (tasks)
    public SolarChartWidgetData buildSolarChartTasks(Integer stageId, String filterParam, String customStart, String customEnd) {
        SolarChartWidgetData.TimeRangeFilter filter = SolarChartWidgetData.TimeRangeFilter.valueOf(filterParam);
        LocalDateTime[] dateRange = resolveDateRange(filter, null);

        List<Object[]> dbResults = timeLogRepository.getSolarChartTaskData(stageId, dateRange[0], dateRange[1]);
        return assembleSolarChartWidget("TASK", stageId, filter, null, dbResults);
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
            Integer minutes = row[3] != null ? ((Number) row[3]).intValue() : 0;

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

            slices.add(SolarChartWidgetData.SolarChartSlice.builder()
                    .sliceId(id)
                    .sliceName(name)
                    .logoOrColor(logoOrColor)
                    .minutesDedicated(minutes)
                    .percentage(percentage)
                    .build());
        }

        return SolarChartWidgetData.builder()
                .currentLayer(layer)
                .parentId(parentId)
                .selectedFilter(filter)
                .customDateRange(customRange)
                .mostRecurringListName(mostRecurringName)
                .slices(slices)
                .build();
    }

    private LocalDateTime[] resolveDateRange(SolarChartWidgetData.TimeRangeFilter filter, SolarChartWidgetData.CustomDateRange customRange) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        LocalDateTime endDate = now;

        switch (filter) {
            case DAILY -> {
                startDate = LocalDate.now().atStartOfDay();
            }
            case WEEKLY -> {
                startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
            }
            case MONTHLY -> {
                startDate = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            }
            case GLOBAL -> {
                startDate = LocalDateTime.of(2010, 1, 1, 0, 0);
            }
            case CUSTOM -> {
                if (customRange != null && customRange.getStartDate() != null && customRange.getEndDate() != null) {
                    startDate = customRange.getStartDate().atStartOfDay();
                    endDate = customRange.getEndDate().atTime(23, 59, 59);
                } else {
                    startDate = LocalDate.now().atStartOfDay();
                }
            }
            default -> startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        }

        return new LocalDateTime[]{startDate, endDate};
    }
    // ==========================================

    // ==========================================
    // CONCENTRATION HEATMAP
    // ==========================================
    private ConcentrationHeatmapWidgetData buildConcentrationHeatmap(Integer userId, UserSettings settings) {
        YearMonth currentMonth = YearMonth.now();
        int year = currentMonth.getYear();
        int month = currentMonth.getMonthValue();

        LocalDateTime startDate = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = currentMonth.plusMonths(1).atDay(1).atStartOfDay();

        // 3. Ejecutar la consulta optimizada que creamos en TimeLogRepository
        List<Object[]> dbResults = timeLogRepository.getHeatmapDataForMonth(userId, startDate, endDate);

        // 4. Mapear resultados a memoria para búsquedas instantáneas O(1)
        Map<Integer, Integer> minutesByDay = new HashMap<>();
        for (Object[] row : dbResults) {
            Integer dayOfMonth = ((Number) row[0]).intValue();
            Integer minutes = ((Number) row[1]).intValue();
            minutesByDay.put(dayOfMonth, minutes);
        }

        List<ConcentrationHeatmapWidgetData.HeatmapDay> daysList = new ArrayList<>();
        int lengthOfMonth = currentMonth.lengthOfMonth();

        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate currentDate = currentMonth.atDay(day);

            Integer minutes = minutesByDay.getOrDefault(day, 0);

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
                EffectivenessChartWidgetData.TimeRange.WEEKLY);
    }

    // A dynamic method for your controller to call when the user changes the chart type
    public EffectivenessChartWidgetData buildEffectivenessChartDynamic(
            Integer userId,
            EffectivenessChartWidgetData.MetricType metric,
            EffectivenessChartWidgetData.TimeRange range) {


        LocalDate startDate;
        LocalDate endDate;

        if (range == EffectivenessChartWidgetData.TimeRange.WEEKLY) {
            // Lunes a Domingo de la semana actual
            startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            endDate = startDate.plusDays(6);
        } else {
            // Día 1 al último día del mes actual
            YearMonth currentMonth = YearMonth.now();
            startDate = currentMonth.atDay(1);
            endDate = currentMonth.atEndOfMonth();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 2. Obtener datos de BD y mapearlos
        Map<LocalDate, Double> percentMap = new HashMap<>();

        if (metric == EffectivenessChartWidgetData.MetricType.CONCENTRATION) {

            // CONCENTRACIÓN: Usamos el porcentaje directo de SQL
            List<Object[]> dbResults = timeLogRepository.getDailyConcentrationPercentage(userId, startDateTime, endDateTime);
            for (Object[] row : dbResults) {
                LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                Double pct = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                percentMap.put(date, pct);
            }

        } else {

            // RENTABILIDAD: Lógica del "Mejor Día"
            List<Object[]> dbResults = timeLogRepository.getDailyProfitability(userId, startDateTime, endDateTime);
            Map<LocalDate, Double> rawProfitMap = new HashMap<>();
            double maxProfit = 0.0;

            // Primero guardamos los valores brutos (€/min) y buscamos el máximo
            for (Object[] row : dbResults) {
                LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                Double profitPerMin = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                rawProfitMap.put(date, profitPerMin);

                if (profitPerMin > maxProfit) {
                    maxProfit = profitPerMin;
                }
            }

            // Luego calculamos el porcentaje en base a ese máximo
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

    private String formatChartLabel(LocalDate date, EffectivenessChartWidgetData.TimeRange range) {
        if (range == EffectivenessChartWidgetData.TimeRange.WEEKLY) {
            // Devuelve la inicial del día (L, M, X, J, V, S, D)
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
            // Para el mes, devuelve el número del día (1, 2, 3... 31)
            return String.valueOf(date.getDayOfMonth());
        }
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
