package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiAdviceWidgetData implements WidgetData {
    private List<AdviceItem> advices;

    @Data
    @Builder
    public static class AdviceItem {
        // The main text (ej. "Optimal focus limit")
        private String label;

        // The key figure (ej. "1h 45m", "Thuesday", "35%")
        private String highlightValue;

        // Severity level or type for the frontend to decide the colour (green, red, grey...)
        private AdviceType type;
    }

    public enum AdviceType {
        POSITIVE,       // To paint the value in green
        WARNING,        // In case AI suggests correcting a bad habit
        NEUTRAL_INFO    // General information
    }
}