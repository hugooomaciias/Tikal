package com.tikal.api.model.dto.sync;

import com.tikal.api.model.dto.sync.widgets.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamMemberDashboardDTO {
    private HeaderTeamDTO header;
    private RankingMemberWidgetData ranking;
    private RecentActivityWidgetData recentActivities;
    private WidgetData calendarWidget;
    private TaskWidgetData taskWidgetData;

    @Data
    @Builder
    public static class HeaderTeamDTO {
        private String role;
        private Double effectiveness;
        private Double progress;
        private Integer rankingPosition;
    }
}
