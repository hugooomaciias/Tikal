package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class TimeLogWidgetData implements WidgetData{
    private List<DailyTimeLogs> days;

    @Data
    @Builder
    public static class DailyTimeLogs {
        private LocalDate date;
        private List<TimeLogData> logs;
    }

    @Data
    @Builder
    public static class TimeLogData {
        private Integer timeLogId;
        private String activityDescription;

        private Instant initTime;
        private Instant endTime;

        private String entityName;
        private Integer projectId;
        private Integer stageId;
        private Integer taskId;

        private String color;
        private String icon;

        private Long durationInSeconds;
        private Boolean isTempleMode;
    }
}
