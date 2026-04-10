package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SolarChartWidgetData implements WidgetData {
    private TimeRangeFilter selectedFilter;
    private CustomDateRange customDateRange;
    private List<SolarChartSlice> slices;
    private String mostRecurringListName;
    private Integer parentId;
    private String currentLayer;

    public enum TimeRangeFilter {
        DAILY,
        WEEKLY,
        MONTHLY,
        GLOBAL,
        CUSTOM
    }

    @Data
    @Builder
    public static class CustomDateRange {
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @Builder
    public static class SolarChartSlice {
        private Integer sliceId;
        private String sliceName;
        private Double percentage;
        private Integer minutesDedicated;
        private String logoOrColor;
    }
}
