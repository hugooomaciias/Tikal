package com.tikal.api.model.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer estimatedTime;
    private Character timeUnit;
    private Boolean isCompleted;
    private Instant completionDate;
    private BigDecimal estimatedProfit;
    private Instant deadline;
    private Integer totalLoggedMinutes;
    private Integer templeLoggedMinutes;
    private Integer subtasksCount;
    private String colour;
    private String logo;
    private Boolean addToCalendar;
    private Boolean isGroupBased;
    private List<TaskDTO> subtasks;
    private List<AssignedUser> assignedUsers;

    @Data
    @Builder
    public static class AssignedUser {
        private Integer id;
        private String name;
        private String avatar;
    }
}
