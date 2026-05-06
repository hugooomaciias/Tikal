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
public class TaskRequest {
    @NotBlank
    private String name;
    private String description;
    private Integer estimatedTime;
    private Character timeUnit;
    private BigDecimal estimatedProfit;
    private LocalDateTime deadline;
    private Boolean addToCalendar;

    @NotNull
    private Integer stageId;

    private List<SubtaskRequest> subtasks;

    @Data
    @Builder
    public static class SubtaskRequest {
        private Integer id;
        @NotBlank
        private String name;
    }
}
