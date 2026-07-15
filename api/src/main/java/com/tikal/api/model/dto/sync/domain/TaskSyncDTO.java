package com.tikal.api.model.dto.sync.domain;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private LocalDateTime deadline;
    private Boolean isCompleted;
    private Integer numberOfSubTask;
    private String logo;
    private String colour;
    private Boolean addToCalendar;

    private List<SubtaskSyncDTO> subtasks;
}
