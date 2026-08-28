package com.tikal.api.config;

import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.TimeLog;
import com.tikal.api.model.entity.TotemList;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TimeLogRepository;
import com.tikal.api.service.GamificationService;
import com.tikal.api.service.StatisticsService;
import com.tikal.api.service.UserService;
import com.tikal.api.utils.DateUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
@Slf4j
public class AiToolsConfig {

    // ========================================================
    // TOOL 1: PERFORMANCE AUDITOR (Stats & Evolution)
    // ========================================================
    public record StatsRequest(String dummy) {}
    public record StatsResponse(Integer globalEffectiveness, Integer planningAccuracy, Map<String, Double> last7DaysEffectiveness) {}

    @Bean
    @Description("Gets the user's productivity statistics, including global effectiveness %, planning accuracy %, and the daily effectiveness percentage of the last 7 days to analyze trends.")
    public Function<StatsRequest, StatsResponse> getUserStatistics(
            StatisticsService statisticsService,
            UserService userService) {

        return request -> {
            log.info("Tool invoked: getUserStatistics");
            User user = userService.getAuthenticatedUser();
            Integer userId = user.getId();

            Map<String, Double> weeklyEvolution = statisticsService.getLast7DaysEffectiveness(userId);

            return new StatsResponse(
                    statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL),
                    statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL),
                    weeklyEvolution
            );
        };
    }

    // ========================================================
    // TOOL 2: PROJECT MANAGER (Pending Tasks & Prioritization)
    // ========================================================
    public record TasksRequest(String dummy) {}
    public record TaskAiDTO(String projectName, String stageName, String taskName, String deadline, Long daysUntilDeadline, Integer estimatedMinutes, Integer currentMinutesSpend, BigDecimal estimatedProfit) {}
    public record PendingTasksResponse(String currentDate, List<TaskAiDTO> pendingTasks) {}

    @Bean
    @Description("Gets the user's pending tasks. Includes project structure, profitability, time currently spend, and deadlines to help prioritize urgency vs profit.")
    public Function<TasksRequest, PendingTasksResponse> getPendingTasksOverview(
            TaskRepository taskRepository,
            UserService userService) {

        return request -> {
            log.info("Tool invoked: getPendingTasksOverview");
            User user = userService.getAuthenticatedUser();

            Instant daysAgo = Instant.now().minus(4, ChronoUnit.DAYS);
            List<Task> pendingTasks = taskRepository.findMainTasksPendingOrCompletedSince(user.getId(), daysAgo)
                    .stream()
                    .filter(t -> !t.getIsCompleted())
                    .toList();

            List<TaskAiDTO> taskDtos = pendingTasks.stream().map(task -> {
                Instant effectiveDeadline = task.getDeadline();
                String stageName = "No Stage";
                String projectName = "No Project";

                if (task.getStage() != null) {
                    stageName = task.getStage().getName();
                    if (effectiveDeadline == null) effectiveDeadline = task.getStage().getDeadline();

                    if (task.getStage().getProject() != null) {
                        projectName = task.getStage().getProject().getName();
                        if (effectiveDeadline == null) effectiveDeadline = task.getStage().getProject().getDeadline();
                    }
                }

                Long daysUntil = null;
                if (effectiveDeadline != null) {
                    daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), effectiveDeadline.atZone(ZoneOffset.UTC).toLocalDate());
                }

                return new TaskAiDTO(
                        projectName,
                        stageName,
                        task.getName(),
                        effectiveDeadline != null ? DateUtils.formatSingleDate(effectiveDeadline.atZone(ZoneOffset.UTC).toLocalDate()) : "Sin Deadline",
                        daysUntil,
                        task.getEstimatedTime(),
                        task.getTotalLoggedMinutes(),
                        task.getEstimatedProfit()
                );
            }).collect(Collectors.toList());

            return new PendingTasksResponse(DateUtils.formatSingleDate(LocalDate.now()), taskDtos);
        };
    }

    // ========================================================
    // TOOL 3: GAMIFICATION GUIDE (Temple Mode)
    // ========================================================
    public record GamificationRequest(String dummy) {}
    public record GamificationResponse(String currentRank, List<String> unlockedTotems, List<String> lockedTotemsForCurrentRank) {}

    @Bean
    @Description("Gets the user's Temple Mode status, including current rank, unlocked totems, and the locked totems required to level up.")
    public Function<GamificationRequest, GamificationResponse> getGamificationStatus(
            GamificationService gamificationService,
            UserService userService) {

        return request -> {
            log.info("Tool invoked: getGamificationStatus");
            User user = userService.getAuthenticatedUser();
            Integer userId = user.getId();

            List<TotemList> unlocked = gamificationService.obtainTheActivesTotems(userId);
            List<TotemList> rankTotems = gamificationService.obtainRankTotemList(user.getCurrentRank().getId());

            List<String> unlockedNames = unlocked.stream().map(TotemList::getName).toList();
            List<String> lockedNames = rankTotems.stream()
                    .filter(t -> !unlocked.contains(t))
                    .map(t -> t.getName() + " (Goal: " + t.getGoalDescription() + ")")
                    .toList();

            return new GamificationResponse(
                    user.getCurrentRank().getAwardedTitle(),
                    unlockedNames,
                    lockedNames
            );
        };
    }

    // ========================================================
    // TOOL 4: TIME PATTERN AUDITOR (Context Switching & Focus Hours)
    // ========================================================
    public record TimeLogsRequest(String dummy) {}
    public record TimeLogAiDTO(String activityName, String initTime, String endTime, Boolean isTempleMode) {}

    @Bean
    @Description("Gets the user's time logs from the last 5 days to analyze focus patterns, best working hours, and detect excessive context switching.")
    public Function<TimeLogsRequest, List<TimeLogAiDTO>> getRecentTimeLogsOverview(
            TimeLogRepository timeLogRepository,
            UserService userService) {

        return request -> {
            log.info("Tool invoked: getRecentTimeLogsOverview");
            User user = userService.getAuthenticatedUser();

            Instant threeDaysAgo = Instant.now().minus(5, ChronoUnit.DAYS);
            List<TimeLog> recentLogs = timeLogRepository.findByUserIdAndInitDateTimeBetween(
                    user.getId(), threeDaysAgo, Instant.now()
            );

            return recentLogs.stream()
                    .filter(log -> log.getEndDateTime() != null)
                    .map(log -> {
                        String name = "Desconocido";
                        if (log.getTask() != null) name = log.getTask().getName();
                        else if (log.getStage() != null) name = log.getStage().getName();
                        else if (log.getProject() != null) name = log.getProject().getName();

                        return new TimeLogAiDTO(
                                name,
                                DateUtils.formatDateTime(log.getInitDateTime()),
                                DateUtils.formatDateTime(log.getEndDateTime()),
                                log.getIsTempleMode()
                        );
                    })
                    .collect(Collectors.toList());
        };
    }
}
