package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TempleModeWidgetData implements WidgetData {
    private Integer todayFocusedMinutes;
    private Integer defaultFocusSessionMinutes;
}