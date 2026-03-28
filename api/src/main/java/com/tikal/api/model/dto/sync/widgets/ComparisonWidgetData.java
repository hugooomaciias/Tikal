package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ComparisonWidgetData implements WidgetData {

    // The currently selected filter
    private TimeRangeFilter selectedFilter;

    private List<ComparisonMetric> metrics;

    @Data
    @Builder
    public static class ComparisonMetric {
        // An internal identifier in case the front end requires a specific icon (e.g. ‘EFFECTIVENESS’)
        private String id;

        // The text to be displayed (e.g. ‘effectiveness’, ‘hours recorded’)
        private String label;

        // The value to be displayed (e.g. ‘+17%’, ‘-5%’, ‘+2h’)
        private String displayValue;

        // It tells the front what color to paint the text (green, red, or grey)
        private Trend direction;
    }

    public enum Trend {
        POSITIVE, // Green text
        NEGATIVE, // Red text
        NEUTRAL   // Grey neutral text
    }

    public enum TimeRangeFilter {
        THIS_WEEK,
        THIS_MONTH
    }
}