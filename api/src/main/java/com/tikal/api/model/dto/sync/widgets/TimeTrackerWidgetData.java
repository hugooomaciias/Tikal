package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimeTrackerWidgetData implements WidgetData {
    private Integer taskId;

    private String taskName;
    private String subtaskName;
    private String parentColor;
    private String projectLogoIcon;

    private Integer accumulatedSeconds;
}