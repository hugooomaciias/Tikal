package com.tikal.api.model.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CreateTaskRequest {
    @NotBlank
    private String name;
    private String description;
    private Integer estimatedTime;
    private BigDecimal estimatedProfit;
    private LocalDateTime deadline;

    @NotNull
    private Integer stageId;

    private List<CreateSubtaskRequest> subtasks;
}
