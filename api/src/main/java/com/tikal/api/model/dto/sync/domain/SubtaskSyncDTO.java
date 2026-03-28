package com.tikal.api.model.dto.sync.domain;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SubtaskSyncDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer estimatedTime;
    private BigDecimal estimatedProfit;
    private LocalDateTime deadline;
    private Boolean isCompleted;
}
