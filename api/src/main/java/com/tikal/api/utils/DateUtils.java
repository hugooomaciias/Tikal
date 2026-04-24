package com.tikal.api.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateUtils {

    private static final Locale SPANISH_LOCALE = new Locale("es", "ES");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM", SPANISH_LOCALE);
    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");

    /**
     * Format a range of dates.
     * Examples: "27 - 29 sep" | "30 sep - 6 oct" | "21 - 27 sep, 2026"
     */
    public static String formatDateRange(LocalDate startDate, LocalDate endDate, boolean includeYear) {
        String startMonth = startDate.format(MONTH_FORMATTER).replace(".", "").toLowerCase();
        String endMonth = endDate.format(MONTH_FORMATTER).replace(".", "").toLowerCase();

        String baseSubtitle;

        if (startDate.getMonth() == endDate.getMonth()) {
            // Case: same month -> "27–29 Sep"
            baseSubtitle = String.format("%d - %d %s",
                    startDate.getDayOfMonth(),
                    endDate.getDayOfMonth(),
                    endMonth);
        } else {
            // Case: different months -> "30 sep - 6 oct"
            baseSubtitle = String.format("%d %s - %d %s",
                    startDate.getDayOfMonth(),
                    startMonth,
                    endDate.getDayOfMonth(),
                    endMonth);
        }

        if (includeYear) {
            String year = endDate.format(YEAR_FORMATTER);
            return baseSubtitle + ", " + year;
        }

        return baseSubtitle;
    }

    /**
     * Format a single day.
     * Example: "26 sep"
     */
    public static String formatSingleDate(LocalDate date) {
        String month = date.format(MONTH_FORMATTER).replace(".", "").toLowerCase();
        return String.format("%d %s", date.getDayOfMonth(), month);
    }

    /**
     * Format a range of dates.
     * Examples: "27-29 SEP"
     */
    public static String formatDateRangeMinimal(LocalDateTime startDate, LocalDateTime endDate) {
        String endMonth = endDate.format(MONTH_FORMATTER).replace(".", "").toUpperCase();

        String baseSubtitle;
        baseSubtitle = String.format("%d-%d %s",
                startDate.getDayOfMonth(),
                endDate.getDayOfMonth(),
                endMonth);

        return baseSubtitle;
    }

    /**
     * Format a LocalDateTime to a string time
     * Examples: 2021-05-03T18:15:44.923163 -> "18:15"
     */
    public static String formatLocalDateTime (LocalDateTime dateTime) {
        return  dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * Format the minutes to return the hour and minutes
     * Examples: 355 min -> "5h 55m"
     */
    public static String formatMinutes(int minutes) {
        String result = "0 h";
        int hours = minutes / 60;
        int min = minutes % 60;

        if (min > 0) {
            result = hours + "h " + min + "m";
        } else if (hours > 0) {
            result = hours + " h";
        }
        return result;
    }

    /**
     * Format the minutes to return the hour and minutes
     * Examples: 355 min -> "5h 55m", and 30 min -> "30 m"
     */
    public static String formatMinutesForSolarChart(int minutes) {
        String result = "0 min";
        int hours = minutes / 60;
        int min = minutes % 60;

        if (hours > 0 && min > 0) {
            result = hours + "h " +  min + "m";
        } else if (hours > 0) {
            result = hours + " h";
        } else if (min > 0) {
            result = min + " m";
        }
        return result;
    }
}
