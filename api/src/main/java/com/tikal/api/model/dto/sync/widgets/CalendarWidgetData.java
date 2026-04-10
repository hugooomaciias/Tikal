package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class CalendarWidgetData implements WidgetData {

    // The range for the week that the widget should display
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startHour;

    private Boolean showWeekends;
}