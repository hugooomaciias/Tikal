package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ConcentrationHeatmapWidgetData implements WidgetData {

    private Integer year;
    private Integer month;

    // List of data for each day of the month
    private List<HeatmapDay> days;

    @Data
    @Builder
    public static class HeatmapDay {
        private LocalDate date;
        private Integer dayOfMonth;

        // Data for the tooltip when hovering
        private Integer minutesDedicated;

        // Color level so that the front knows what shad to paint
        private IntensityLevel intensity;
    }

    // Enum the 5 color levels that can be seen in your design.
    public enum IntensityLevel {
        NONE,       // Background color
        LOW,        // Ultralight color
        MEDIUM,     // Light color
        HIGH,       // Dark color
        MAXIMUM     // Ultra dark color
    }
}