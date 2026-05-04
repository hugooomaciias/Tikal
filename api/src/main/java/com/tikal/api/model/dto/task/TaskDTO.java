package com.tikal.api.model.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private Boolean isCompleted;
    private LocalDateTime completionDate;
    private BigDecimal estimatedProfit;
    private LocalDateTime deadline;
    private Integer totalLoggedMinutes;
    private Integer templeLoggedMinutes;
    private Integer subtasksCount;
    private String colour;
    private String logo;
    private Boolean addToCalendar;
    private List<TaskDTO> subtasks;
}
