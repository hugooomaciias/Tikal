package com.tikal.api.model.dto.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CreateSubtaskRequest {
    @NotBlank
    private String name;
    private Integer estimatedTime;
    private BigDecimal estimatedProfit;
}