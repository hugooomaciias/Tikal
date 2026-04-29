package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TimeGoalWidgetData implements WidgetData {
    private String currentMinutes;
    private Integer goalMinutes;

    private Double completionPercentage;

    private LocalDate startDate;
    private LocalDate endDate;
    private String subtitle;
}