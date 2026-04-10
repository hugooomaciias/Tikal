package com.tikal.api.service;

import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.entity.TotemInventory;
import com.tikal.api.model.entity.TotemList;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.enumerated.TypeOfGoal;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TimeLogRepository;
import com.tikal.api.repository.TotemInventoryRepository;
import com.tikal.api.repository.TotemListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService {
    private final TotemInventoryRepository totemInventoryRepository;
    private final TotemListRepository totemListRepository;
    private final TimeLogRepository timeLogRepository;
    private final TaskRepository taskRepository;
    private final StatisticsService statisticsService;

    public List<TotemInventory> obtainUserTotemInventory(Integer userId) {
        return totemInventoryRepository.findByUser_Id(userId);
    }

    public List<TotemList> obtainRankTotemList(Integer rank) {
        return totemListRepository.findByRequiredRank(rank);
    }

    public List<TotemList> obtainTheActivesTotems(Integer userId, Integer rank) {
        var totemInventory = totemInventoryRepository.findByUserIdAndTotemId(userId, rank);
        List<TotemList> totemList = new ArrayList<>();

        for (TotemInventory t : totemInventory) {
            totemList.add(t.getTotem());
        }
        return totemList;
    }

    public WorkspaceSyncDTO.ProgressData obtainCurrentUserProgress(Integer userId, TypeOfGoal typeOfGoal) {
        switch (typeOfGoal) {
            case CONCENTRATION:
                Integer totalHours = getTotalTempleTime(userId);
                return new WorkspaceSyncDTO.ProgressData(totalHours, "Horas de concentración acumuladas");

            case PLANNING_ACCURACY:
                Integer planningAccuracy = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                return new WorkspaceSyncDTO.ProgressData(planningAccuracy, "Porcentaje de precisión en planificación");

            case GLOBAL_EFFECTIVENESS:
                Integer globalEffectiveness = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                return new WorkspaceSyncDTO.ProgressData(globalEffectiveness, "Porcentaje de efectividad global");

            case PLANNING_ACCURACY_WITH_TASKS:
                Integer accuracy = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                Integer tasksWithEstimate = statisticsService.countTasksWithEstimate(userId, TimeRangeSetting.GLOBAL);
                return new WorkspaceSyncDTO.ProgressData(accuracy, "tasks:" + tasksWithEstimate);

            case EFFECTIVENESS_WITH_TASKS:
                Integer effectiveness = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                Integer completedTasks = statisticsService.countCompletedTasks(userId, TimeRangeSetting.GLOBAL);
                return new WorkspaceSyncDTO.ProgressData(effectiveness, "tasks:" + completedTasks);

            case EFFECTIVENESS_WITH_STREAK:
                Integer currentEffectiveness = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                Integer streakDays = calculateEffectivenessStreak(userId, 85.0);
                return new WorkspaceSyncDTO.ProgressData(currentEffectiveness, "streak:" + streakDays);

            case PLANNING_AND_EFFECTIVENESS:
                Integer planning = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                Integer effectiveness1 = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                return new WorkspaceSyncDTO.ProgressData(planning, "effectiveness:" + effectiveness1);

            case ALL_PREVIOUS_TOTEMS:
                Integer unlockedTotems = countUserTotems(userId);
                return new WorkspaceSyncDTO.ProgressData(unlockedTotems, "Tótems desbloqueados");

            default:
                throw new IllegalArgumentException("Tipo de objetivo no soportado: " + typeOfGoal);
        }
    }

    public Integer countUserTotems(Integer userId) {
        return totemInventoryRepository.countByUserId(userId);
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

    public Integer getTotalTempleTime(Integer userId) {
        Integer totalMinutes = timeLogRepository.sumMinutesInTempleModeByUserId(userId);
        return totalMinutes != null ? totalMinutes : 0;
    }
}
