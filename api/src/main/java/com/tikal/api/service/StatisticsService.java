package com.tikal.api.service;

import com.tikal.api.model.entity.Task;
import com.tikal.api.model.entity.TimeLog;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TimeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final TaskRepository taskRepository;

    // =====================================================
    // 1. PLANNING ACCURACY
    // =====================================================
    public Integer planningAccuracy(Integer userId, TimeRangeSetting range) {
        LocalDateTime since = getStartDate(range);

        List<Task> completedTasks = taskRepository.findCompletedTasksWithEstimateByUserAndDate(userId, since);

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

    // =====================================================
    // 2. GLOBAL EFFECTIVENESS
    // =====================================================
    public Integer globalEffectiveness(Integer userId, TimeRangeSetting range) {
        LocalDateTime since = getStartDate(range);
        List<Task> completedTasks = taskRepository.findCompletedTasksWithEstimateByUserAndDate(userId, since);

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

    // =====================================================
    // 3. COUNT TASKS WITH ESTIMATE
    // =====================================================
    public Integer countTasksWithEstimate(Integer userId, TimeRangeSetting range) {
        LocalDateTime since = getStartDate(range);
        return taskRepository.countTasksWithEstimateByUserAndDate(userId, since);
    }

    // =====================================================
    // 4. COUNT COMPLETED TASKS
    // =====================================================
    public Integer countCompletedTasks(Integer userId, TimeRangeSetting range) {
        LocalDateTime since = getStartDate(range);
        return taskRepository.countCompletedTasksByUserAndDate(userId, since);
    }

    // =====================================================
    // UTILS
    // =====================================================
    private LocalDateTime getStartDate(TimeRangeSetting range) {
        LocalDateTime now = LocalDateTime.now();
        return switch (range) {
            case SEMANAL -> now.minusWeeks(1);
            case MENSUAL -> now.minusMonths(1);
            case TRIMESTRAL -> now.minusMonths(3);
            case ANUAL -> now.minusYears(1);
            case GLOBAL -> LocalDateTime.of(2010, 1, 1, 0, 0);
        };
    }
}
