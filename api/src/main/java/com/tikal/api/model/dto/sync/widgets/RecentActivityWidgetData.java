package com.tikal.api.model.dto.sync.widgets;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class RecentActivityWidgetData {
    private List<ActivityData> activities;

    public enum ActivityType {
        CHAT, TASK, CALENDAR, ROLE, DEADLINE
    }

    @Data
    @Builder
    public static class ActivityData {
        private String title;
        private String description;
        private Instant date;
        private ActivityType type;
        private LinkedEntity linkedEntity;
    }

    @Data
    @Builder
    public static class LinkedEntity {
        public Integer projectId;
        public Integer stageId;
        public Integer taskId;
        public String logo;
        public String colour;
        public String name;
    }
}
