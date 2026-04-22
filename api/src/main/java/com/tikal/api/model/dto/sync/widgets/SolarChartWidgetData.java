package com.tikal.api.model.dto.sync.widgets;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String colour;
    private String logo;

    public enum TimeRangeFilter {
        DAILY,
        WEEKLY,
        MONTHLY,
        GLOBAL,
        CUSTOM
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
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
        private String logoOrColour;
    }
}
