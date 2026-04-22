package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class WeeklyProgressWidgetData implements WidgetData {
    private String subtitle;

    private List<DailyProgress> days;

    @Data
    @Builder
    public static class DailyProgress {
        private LocalDate date;
        private String dayLabel;

        private Integer minutesDedicated;
    }

    public static String getSpanishDayLabel(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "L";
            case TUESDAY -> "M";
            case WEDNESDAY -> "X";
            case THURSDAY -> "J";
            case FRIDAY -> "V";
            case SATURDAY -> "S";
            case SUNDAY -> "D";
        };
    }
}