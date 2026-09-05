package com.tikal.api.model.dto.sync.domain;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TaskSyncDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer estimatedTime;
    private Character timeUnit;
    private BigDecimal estimatedProfit;
    private Instant deadline;
    private Boolean isCompleted;
    private Integer numberOfSubTask;
    private String logo;
    private String colour;
    private Boolean addToCalendar;
    private Boolean isGroupBased;
    private List<SubtaskSyncDTO> subtasks;
    private List<AssignedUser> assignedUsers;

    @Data
    @Builder
    public static class AssignedUser {
        private Integer id;
        private String name;
        private String avatar;
    }
}
