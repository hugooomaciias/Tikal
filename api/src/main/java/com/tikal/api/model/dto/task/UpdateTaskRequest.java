package com.tikal.api.model.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private String name;
    private String description;
    private Integer estimatedTime;
    private BigDecimal estimatedProfit;
    private LocalDateTime deadline;
    private Boolean isCompleted;
    private Integer stageId;
    private Integer parentTaskId;
}
