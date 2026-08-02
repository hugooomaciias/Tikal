package com.tikal.api.service.cache;

import com.tikal.api.model.entity.TimeLog;
import com.tikal.api.model.entity.UserSettings;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@Component
@RequestScope
@Getter
@Setter
public class PreFetchedDashboardData {
    private int todayTotalMinutes;

    private int currentWeekTotalMinutes;
    private int currentWeekTempleMinutes;
    private Map<LocalDate, Integer> weekDailyMinutes;
    private Map<LocalDate, Double> weekConcentrationPercentage;
    private Map<LocalDate, Integer> rollingWeekDailyMinutes;
    private List<TimeLog> rollingWeekLogs; // raw logs for timeLogWidget

    private int prevWeekTotalMinutes;
    private int prevWeekTempleMinutes;
    private int prevMonthTotalMinutes;
    private int prevMonthTempleMinutes;

    private List<TimeLog> monthLogs;  // raw logs for heatmap & effectiveness
    private int currentMonthTotalMinutes;
    private int currentMonthTempleMinutes;
    private Map<LocalDate, Integer> monthDailyMinutes;
    private Map<LocalDate, Double> monthConcentrationPercentage;

    private Integer globalTempleMinutes;
    private Integer globalTotalMinutes;

    public static LocalDateTime getWeekStart(UserSettings settings) {
        DayOfWeek firstDay = (settings.getFirstDayOfWeek() != null &&
                settings.getFirstDayOfWeek().name().equalsIgnoreCase("DOMINGO"))
                ? DayOfWeek.SUNDAY : DayOfWeek.MONDAY;
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(firstDay)).atStartOfDay();
    }
}
