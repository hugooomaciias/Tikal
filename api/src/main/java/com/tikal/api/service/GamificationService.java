package com.tikal.api.service;

import com.tikal.api.exception.ConflictException;
import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import com.tikal.api.model.dto.sync.domain.GamificationEventDTO;
import com.tikal.api.model.entity.RankList;
import com.tikal.api.model.entity.TotemInventory;
import com.tikal.api.model.entity.TotemList;
import com.tikal.api.model.entity.User;
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
    private final UserService userService;
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

    public List<WorkspaceSyncDTO.TotemSyncDTO> buildUserTotems(User user) {
        var totemList = this.obtainUserTotemInventory(user.getId());
        List<WorkspaceSyncDTO.TotemSyncDTO> userTotems = new ArrayList<>();

        for (TotemInventory t : totemList) {
            TotemList totem = t.getTotem();

            var totemDTO = WorkspaceSyncDTO.TotemSyncDTO.builder()
                    .id(totem.getId())
                    .name(totem.getName())
                    .goalDescription(totem.getGoalDescription())
                    .targetProgress1(totem.getTargetProgress())
                    .targetProgress2(totem.getTargetProgress2())
                    .totemImageUrl(totem.getTotemImageUrl())
                    .isActive(true)
                    .rank(totem.getRequiredRank())
                    .totemType(totem.getTypeOfGoal())
                    .build();

            userTotems.add(totemDTO);
        }
        return userTotems;
    }

    public WorkspaceSyncDTO.TempleSyncDTO buildTempleMode(User user, Integer globalTempleMinutes, List<GamificationEventDTO> gamificationEvents) {
        RankList currentRank = user.getCurrentRank();
        preFetchedDashboardData.setGlobalTempleMinutes(globalTempleMinutes);

        return WorkspaceSyncDTO.TempleSyncDTO.builder()
                .rank(currentRank.getId())
                .templeName(currentRank.getTempleName())
                .awardedTitle(currentRank.getAwardedTitle())
                .requiredHours(currentRank.getNextHours())
                .currentHours(globalTempleMinutes / 60)
                .badgeImageUrl(currentRank.getBadgeImageUrl())
                .clockImageUrl(currentRank.getClockImageUrl())
                .templeImageUrl(currentRank.getTempleImageUrl())
                .primaryColor(currentRank.getColour())
                .totems(buildTempleTotems(user, gamificationEvents))
                .build();
    }

    private List<WorkspaceSyncDTO.TotemSyncDTO> buildTempleTotems(User user, List<GamificationEventDTO> gamificationEvents) {
        var totemList = this.obtainRankTotemList(user.getCurrentRank().getId());
        List<WorkspaceSyncDTO.TotemSyncDTO> templeTotems = new ArrayList<>();
        List<TotemList> totemActives = this.obtainTheActivesTotems(user.getId());

        for (TotemList t : totemList) {
            boolean isUnlocked = totemActives.contains(t);
            boolean justUnlocked = false;

            WorkspaceSyncDTO.ProgressData progressData = this.obtainCurrentUserProgress(user.getId(), t, totemActives, isUnlocked);

            if (!isUnlocked) {
                boolean goal1Reached = progressData.getProgress1() >= t.getTargetProgress();
                boolean goal2Reached = t.getTargetProgress2() == null || progressData.getProgress2() >= t.getTargetProgress2();

                if (goal1Reached && goal2Reached) {
                    this.grantTotemToUser(user.getId(), t.getId());
                    isUnlocked = true;
                    justUnlocked = true;

                    progressData.setProgress1(t.getTargetProgress());
                    if (t.getTargetProgress2() != null) {
                        progressData.setProgress2(t.getTargetProgress2());
                    }

                    gamificationEvents.add(GamificationEventDTO.builder()
                            .type("TOTEM_UNLOCKED")
                            .title("¡Tótem Desbloqueado!")
                            .message("Has conseguido el tótem: " + t.getName())
                            .imageUrl(t.getTotemImageUrl())
                            .build());
                }
            }

            var totemDTO = WorkspaceSyncDTO.TotemSyncDTO.builder()
                    .id(t.getId())
                    .name(t.getName())
                    .goalDescription(t.getGoalDescription())
                    .targetProgress1(t.getTargetProgress())
                    .targetProgress2(t.getTargetProgress2())
                    .totemImageUrl(t.getTotemImageUrl())
                    .totemType(t.getTypeOfGoal())
                    .currentProgress(progressData)
                    .isActive(isUnlocked)
                    .justUnlocked(justUnlocked)
                    .rank(t.getRequiredRank())
                    .build();

            templeTotems.add(totemDTO);
        }
        return templeTotems;
    }

    public User checkRank(User currentUser, RankList currentRank, List<GamificationEventDTO> gamificationEvents, int globalTempleHours) {
        if (currentRank.getNextHours() <= globalTempleHours && !currentRank.getNextHours().equals(currentRank.getRequiredHours())) {
            currentUser = userService.upgradeUserRank(currentUser);

            gamificationEvents.add(GamificationEventDTO.builder()
                    .type("RANK_UP")
                    .title("¡Enhorabuena!")
                    .message("Has subido de rango: " + currentUser.getCurrentRank().getAwardedTitle())
                    .imageUrl(currentUser.getCurrentRank().getBadgeImageUrl())
                    .build());
        }

        return currentUser;
    }
}
