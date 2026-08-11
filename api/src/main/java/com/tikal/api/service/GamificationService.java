package com.tikal.api.service;

import com.tikal.api.exception.ConflictException;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.entity.TotemInventory;
import com.tikal.api.model.entity.TotemList;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TotemInventoryRepository;
import com.tikal.api.repository.TotemListRepository;
import com.tikal.api.service.cache.PreFetchedDashboardData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService {
    private final TotemInventoryRepository totemInventoryRepository;
    private final TotemListRepository totemListRepository;
    private final TaskRepository taskRepository;
    private final StatisticsService statisticsService;
    private final PreFetchedDashboardData preFetchedDashboardData;

    public List<TotemInventory> obtainUserTotemInventory(Integer userId) {
        return totemInventoryRepository.findByUser_Id(userId);
    }

    public List<TotemList> obtainRankTotemList(Integer rank) {
        return totemListRepository.findByRequiredRankLessThanEqual(rank);
    }

    public List<TotemList> obtainTheActivesTotems(Integer userId) {
        var totemInventory = totemInventoryRepository.findByUser_Id(userId);
        List<TotemList> totemList = new ArrayList<>();

        for (TotemInventory t : totemInventory) {
            totemList.add(t.getTotem());
        }
        return totemList;
    }

    public WorkspaceSyncDTO.ProgressData obtainCurrentUserProgress(Integer userId, TotemList totem, List<TotemList> activeTotems, boolean isUnlocked) {
        Integer actualProgress1 = 0;
        Integer actualProgress2 = 0;
        String desc1 = "";
        String desc2 = null;

        switch (totem.getTypeOfGoal()) {
            case CONCENTRATION:
                if (!isUnlocked) actualProgress1 = preFetchedDashboardData.getGlobalTempleMinutes() / 60;
                desc1 = "Horas de concentración acumuladas";
                break;

            case PLANNING_ACCURACY:
                if (!isUnlocked) actualProgress1 = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                desc1 = "Porcentaje de precisión en planificación";
                break;

            case GLOBAL_EFFECTIVENESS:
                if (!isUnlocked) actualProgress1 = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                desc1 = "Porcentaje de efectividad global";
                break;

            case PLANNING_ACCURACY_WITH_TASKS:
                if (!isUnlocked) actualProgress1 = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                if (!isUnlocked) actualProgress2 = statisticsService.countTasksWithEstimate(userId, TimeRangeSetting.GLOBAL);
                desc1 = "Porcentaje de precisión en planificación";
                desc2 = "Tareas con estimación completadas";
                break;

            case EFFECTIVENESS_WITH_TASKS:
                if (!isUnlocked) actualProgress1 = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                if (!isUnlocked) actualProgress2 = statisticsService.countCompletedTasks(userId, TimeRangeSetting.GLOBAL);
                desc1 = "Porcentaje de efectividad global";
                desc2 = "Tareas con estimación completadas";
                break;

            case EFFECTIVENESS_WITH_STREAK:
                if (!isUnlocked) actualProgress1 = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                if (!isUnlocked) actualProgress2 = calculateEffectivenessStreak(userId, 75.0);
                desc1 = "Porcentaje de efectividad global";
                desc2 = "Días consecutivos con eficiencia > 75%";
                break;

            case PLANNING_AND_EFFECTIVENESS:
                if (!isUnlocked) actualProgress1 = statisticsService.planningAccuracy(userId, TimeRangeSetting.GLOBAL);
                if (!isUnlocked) actualProgress2 = statisticsService.globalEffectiveness(userId, TimeRangeSetting.GLOBAL);
                desc1 = "Porcentaje de precisión en planificación";
                desc2 = "Porcentaje de efectividad global";
                break;

            case ALL_PREVIOUS_TOTEMS:
                if (!isUnlocked) actualProgress1 = activeTotems.size();
                desc1 = "Tótems desbloqueados";
                break;

            default:
                throw new ConflictException("Tipo de objetivo no soportado: " + totem.getTypeOfGoal());
        }

        Integer cappedProgress1 = Math.min(actualProgress1, totem.getTargetProgress());
        Integer cappedProgress2 = totem.getTargetProgress2() != null
                ? Math.min(actualProgress2, totem.getTargetProgress2())
                : null;

        WorkspaceSyncDTO.ProgressData.ProgressDataBuilder builder = WorkspaceSyncDTO.ProgressData.builder()
                .progress1(cappedProgress1)
                .description1(desc1);

        if (desc2 != null) {
            builder.progress2(cappedProgress2)
                    .description2(desc2);
        }

        return builder.build();
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

    public void grantTotemToUser(Integer userId, Integer totemId) {
        totemInventoryRepository.grantTotemToUser(userId, totemId);
    }
}
