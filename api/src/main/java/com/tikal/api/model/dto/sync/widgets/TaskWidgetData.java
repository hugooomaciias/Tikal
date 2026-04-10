package com.tikal.api.model.dto.sync.widgets;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TaskWidgetData implements WidgetData {

    // Current configuration chosen by the user
    private GroupingMode selectedGroupingMode;

    // Overall percentage of tasks completed (18% of the design)
    private Double globalProgressPercentage;

    // Flag to notify the Front that there are more cards waiting in the database
    private Boolean hasMoreCards;

    private List<TaskCard> cards;

    public enum GroupingMode {
        BY_DEADLINE,
        BY_PROJECT
    }

    @Data
    @Builder
    public static class TaskCard {
        private String title;
        private String subtitle;
        private Integer completedTasksCount;
        private Integer totalTasksCount;
        private List<TaskItem> tasks;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TaskItem {
        private Integer taskId;
        private String name;
        private String iconIdentifier;
        private String colorHex;
        private Integer subtasksCount;
        private Boolean isCompleted;
    }
}