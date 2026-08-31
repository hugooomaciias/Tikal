package com.tikal.api.model.dto.sync;

import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.sync.domain.StageSyncDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectDashboardDTO {
    private Integer projectId;
    private String projectName;
    private String logo;
    private Integer leftDays;
    private Integer completedTasks;
    private Integer pendingTasks;
    private Integer progress;
    private Integer teamEffectiveness;
    private Integer totalLoggedMinutes;
    private List<StageSyncDTO> stages;
    private List<CalendarEventDTO> calendarEvents;
    private List<TeamMemberSyncDTO> members;

    @Data
    @Builder
    public static class TeamMemberSyncDTO {
        private Integer id;
        private String name;
        private String avatar;
        private String role;
        private Integer completedTasks;
        private Integer pendingTasks;
    }
}
