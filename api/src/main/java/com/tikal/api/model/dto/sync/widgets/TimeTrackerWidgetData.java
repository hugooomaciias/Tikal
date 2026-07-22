package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeTrackerWidgetData implements WidgetData {
    private Integer taskId;
    private Integer stageId;
    private Integer projectId;

    private String entityName;
    private String colour;
    private String logo;
    private Instant initDateTime;
    private Long accumulatedSeconds;
}