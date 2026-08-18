package com.tikal.api.service;

import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.service.cache.SyncCache;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final TaskRepository taskRepository;
    private final SyncCache requestCache;

    // =====================================================
    // 1. PLANNING ACCURACY
    // =====================================================
    public Integer planningAccuracy(Integer userId, TimeRangeSetting range) {
        String key = "stats_planningAccuracy_" + userId + "_" +  range.name();
        return requestCache.get(key, () -> {
            return computePlanningAccuracy(userId, range);
        });
    }

    private Integer computePlanningAccuracy(Integer userId, TimeRangeSetting range) {
        List<Task> completedTasks = getCompletedTasksWithEstimate(userId, range);

        if (completedTasks.isEmpty()) return 0;

        double totalAccuracy = 0;
        int validTasks = 0;

        for (Task task : completedTasks) {
            Integer estimated = task.getEstimatedTime();
            Integer actual = task.getTotalLoggedMinutes();

            if (actual == null || actual <= 0) continue;

            double accuracy = getAccuracy(actual, estimated);

            totalAccuracy += accuracy;
            validTasks++;
        }

        return validTasks == 0 ? 0 : (int) Math.round(totalAccuracy / validTasks);
    }

    private static double getAccuracy(Integer actual, Integer estimated) {
        final double OVERESTIMATE_TOLERANCE = 0.15;
        double ratio = (double) actual / estimated;
        double accuracy;

        if (Math.abs(ratio - 1.0) <= 0.01) {
            accuracy = 100.0;
        } else if (actual > estimated) {
            double overrun = (double) (actual - estimated) / estimated;
            accuracy = Math.max(0, 100 - (overrun * 100));
        } else {
            double underrun = (double) (estimated - actual) / estimated;
            if (underrun <= OVERESTIMATE_TOLERANCE) {
                accuracy = 100.0;
            } else {
                double excessUnderrun = underrun - OVERESTIMATE_TOLERANCE;
                accuracy = Math.max(0, 100 - (excessUnderrun * 100));
            }
        }
        return accuracy;
    }

    public Integer calculateEffectivenessStreak(Integer userId, double bias) {
        double EFFECTIVENESS_THRESHOLD = 75.0;
        if (bias > 0) {
            EFFECTIVENESS_THRESHOLD = bias;
        }

        List<Object[]> dailyData = taskRepository.findDailyAverageEffectiveness(userId);

        if (dailyData.isEmpty()) {
            return 0;
        }

        int streak = 0;

        for (Object[] row : dailyData) {
            if (row[1] == null) continue;

            double dailyEffectiveness = ((Number) row[1]).doubleValue();

            if (dailyEffectiveness >= EFFECTIVENESS_THRESHOLD) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Retrieves the daily average effectiveness for the last 7 days.
     * Missing days (where no tasks were completed) are represented as 0.0.
     * Returns a chronological map (e.g., "Monday" -> 85.0).
     */
    public Map<String, Double> getLast7DaysEffectiveness(Integer userId) {
        // 1. Get raw data from DB (ordered DESC by date via SQL)
        List<Object[]> dailyData = taskRepository.findDailyAverageEffectiveness(userId);

        // 2. Prepare a map for the last 7 days with default 0.0 values
        // We use LinkedHashMap to maintain chronological insertion order
        Map<String, Double> weeklyEffectiveness = new LinkedHashMap<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        // Initialize the map chronologically (from 6 days ago up to today)
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            // Extract the English name of the day (e.g., "Monday")
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            weeklyEffectiveness.put(dayName, 0.0);
        }

        // 3. Fill in the actual data from the database
        for (Object[] row : dailyData) {
            if (row[0] == null || row[1] == null) continue;

            // Handle java.sql.Date to LocalDate conversion safely
            LocalDate rowDate;
            if (row[0] instanceof java.sql.Date) {
                rowDate = ((java.sql.Date) row[0]).toLocalDate();
            } else {
                rowDate = LocalDate.parse(row[0].toString());
            }

            // Optimization: Since DB results are DESC, stop if we pass our 7-day window
            if (rowDate.isBefore(today.minusDays(6))) {
                break;
            }

            // If the date is within our 7-day window, update the value
            if (!rowDate.isAfter(today)) {
                String dayName = rowDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                double dailyEffectiveness = ((Number) row[1]).doubleValue();

                // Round to 1 decimal place for cleaner JSON/AI context
                dailyEffectiveness = Math.round(dailyEffectiveness * 10.0) / 10.0;

                weeklyEffectiveness.put(dayName, dailyEffectiveness);
            }
        }

        return weeklyEffectiveness;
    }

    // =====================================================
    // 2. GLOBAL EFFECTIVENESS
    // =====================================================
    public Integer globalEffectiveness(Integer userId, TimeRangeSetting range) {
        String key = "stat_globalEffectiveness_" + userId + "_" + range.name();
        return requestCache.get(key, () -> computeGlobalEffectiveness(userId, range));
    }

    private Integer computeGlobalEffectiveness(Integer userId, TimeRangeSetting range) {
        List<Task> completedTasks = getCompletedTasksWithEstimate(userId, range);

        if (completedTasks.isEmpty()) return 0;

        double totalEffectiveness = 0;
        int validTasks = 0;

        for (Task task : completedTasks) {
            Integer estimated = task.getEstimatedTime();
            Integer actual = task.getTotalLoggedMinutes();

            if (actual == null || actual <= 0) continue;

            double ratio = (double) actual / estimated;

            if (ratio <= 1.0) {
                totalEffectiveness += 100.0;
            } else {
                double effectiveness = Math.max(0, 100 - ((ratio - 1) * 100));
                totalEffectiveness += Math.min(effectiveness, 100);
            }

            validTasks++;
        }

        return validTasks == 0 ? 0 : (int) Math.round(totalEffectiveness / validTasks);
    }

    private List<Task> getCompletedTasksWithEstimate(Integer userId, TimeRangeSetting range) {
        Instant since = getStartDate(range);
        String key = "completedTasks_" + userId + "_" + since.toString();
        return requestCache.get(key, () ->
                taskRepository.findCompletedTasksWithEstimateByUserAndDate(userId, since)
        );
    }

    // =====================================================
    // 3. COUNT TASKS WITH ESTIMATE
    // =====================================================
    public Integer countTasksWithEstimate(Integer userId, TimeRangeSetting range) {
        String key = "stat_countTasksWithEstimate_" + userId + "_" + range.name();
        return requestCache.get(key, () -> {
            Instant since = getStartDate(range);
            return taskRepository.countTasksWithEstimateByUserAndDate(userId, since);
        });
    }

    // =====================================================
    // 4. COUNT COMPLETED TASKS
    // =====================================================
    public Integer countCompletedTasks(Integer userId, TimeRangeSetting range) {
        String key = "stat_countCompletedTasks_" + userId + "_" + range.name();
        return requestCache.get(key, () -> {
            Instant since = getStartDate(range);
            return taskRepository.countCompletedTasksByUserAndDate(userId, since);
        });
    }

    // =====================================================
    // UTILS
    // =====================================================
    private Instant getStartDate(TimeRangeSetting range) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return switch (range) {
            case SEMANAL -> today.minusWeeks(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            case MENSUAL -> today.minusMonths(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            case TRIMESTRAL -> today.minusMonths(3).atStartOfDay().toInstant(ZoneOffset.UTC);
            case ANUAL -> today.minusYears(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            case GLOBAL -> Instant.parse("2010-01-01T00:00:00Z");
        };
    }
}
