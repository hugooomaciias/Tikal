package com.tikal.api.service;

import com.tikal.api.exception.ForbiddenAccessException;
import com.tikal.api.model.dto.sync.TeamMemberDashboardDTO;
import com.tikal.api.model.entity.*;
import com.tikal.api.repository.TaskRepository;
import com.tikal.api.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberDashboardService {
    private final UserService userService;
    private final SettingsService settingsService;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskRepository taskRepository;
    private final WidgetBuilderService widgetBuilderService;
    // Opcional si necesitas traer los datos exactos del widget de calendario:
    // private final WidgetBuilderService widgetBuilderService;

    @Transactional(readOnly = true)
    public TeamMemberDashboardDTO getTeamMemberDashboard(Integer teamId) {
        User currentUser = userService.getAuthenticatedUser();
        Integer userId = currentUser.getId();
        UserSettings settings = settingsService.getSettingsByUserId(userId);

        TeamMember myMembership = teamMemberRepository.findByUserIdAndTeamId(userId, teamId)
                .orElseThrow(() -> new ForbiddenAccessException("No perteneces a este equipo"));

        Integer myPosition = getMyRankingPosition(teamId, userId);

        return TeamMemberDashboardDTO.builder()
                .header(buildHeader(userId, teamId, myMembership.getTeamRole(), myPosition))
                .ranking(widgetBuilderService.buildTeamRankingWidget(teamId, userId))
                .recentActivities(widgetBuilderService.buildRecentActivityWidget(userId, teamId))
                .taskWidgetData(widgetBuilderService.buildTeamTaskWidget(userId, teamId))
                .calendarWidget(widgetBuilderService.buildCalendarWidgetData(settings))
                .build();
    }

    private TeamMemberDashboardDTO.HeaderTeamDTO buildHeader(Integer userId, Integer teamId, String role, Integer myPosition) {
        Double effectivenessRaw = taskRepository.getGlobalTeamEffectiveness(teamId);
        Double effectiveness = effectivenessRaw != null ? Math.round(effectivenessRaw * 10.0) / 10.0 : 0.0;

        List<Object[]> progressResult = taskRepository.getUserProgressInTeam(userId, teamId);

        int totalTasks = 0;
        int completedTasks = 0;

        if (!progressResult.isEmpty() && progressResult.get(0) != null) {
            Object[] row = progressResult.get(0);
            totalTasks = row[0] != null ? ((Number) row[0]).intValue() : 0;
            completedTasks = row[1] != null ? ((Number) row[1]).intValue() : 0;
        }

        double progress = 0.0;
        if (totalTasks > 0) {
            progress = Math.round(((double) completedTasks / totalTasks) * 1000.0) / 10.0;
        }

        return TeamMemberDashboardDTO.HeaderTeamDTO.builder()
                .role(role)
                .effectiveness(effectiveness)
                .progress(progress)
                .rankingPosition(myPosition)
                .build();
    }

    private Integer getMyRankingPosition(Integer teamId, Integer userId) {
        List<Object[]> rawRanking = teamMemberRepository.getTeamRankingByTempleMinutes(teamId);
        for (int i = 0; i < rawRanking.size(); i++) {
            if (((Number) rawRanking.get(i)[0]).intValue() == userId) {
                return i + 1;
            }
        }
        return 0;
    }
}
