package com.tikal.api.utils;

import java.time.LocalDate;
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
}
