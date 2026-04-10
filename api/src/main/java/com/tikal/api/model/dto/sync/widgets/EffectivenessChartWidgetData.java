package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EffectivenessChartWidgetData implements WidgetData {
    private MetricType selectedMetric;
    private TimeRange selectedTimeRange;

    private List<ChartPoint> dataPoints;

    @Data
    @Builder
    public static class ChartPoint {
        // The X-axis label.
        private String label;
        private Double percentage;
    }

    public enum MetricType {
        CONCENTRATION,  // % Conc
        PROFITABILITY   // % Profitability
    }

    public enum TimeRange {
        WEEKLY,
        MONTHLY
    }
}
