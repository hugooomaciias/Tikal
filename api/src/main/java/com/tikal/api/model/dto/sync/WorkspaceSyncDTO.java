package com.tikal.api.model.dto.sync;

import com.tikal.api.model.dto.UserSettingsDTO;
import com.tikal.api.model.dto.sync.domain.ProjectSyncDTO;
import com.tikal.api.model.dto.sync.widgets.WidgetData;
import com.tikal.api.model.entity.enumerated.TypeOfGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class WorkspaceSyncDTO {

    private UserProfileSyncDTO userProfile;
    private UserSettingsDTO settings;
    private TempleSyncDTO templeMode;
    private List<CalendarEventSyncDTO> calendarEvents;

    private List<HeaderInformation> homeGeneralInformation;
    private Map<String, WidgetData> homeWidgetsData;

    private List<HeaderInformation> statisticsGeneralInformation;
    private Map<String, WidgetData> statisticsWidgetsData;

    private List<ProjectSyncDTO> tasks;

    // ==========================================
    // 1. USER PROFILE
    // ==========================================
    @Data
    @Builder
    public static class UserProfileSyncDTO {
        private String name;
        private String email;
        private String avatarUrl;
        private String subscriptionPlan;
        private List<TotemSyncDTO> totems;
    }

    // ==========================================
    // 3. TEMPLE MODE
    // ==========================================
    @Data
    @Builder
    public static class TempleSyncDTO {
        private Integer rank;
        private String templeName;
        private String awardedTitle;
        private Integer requiredHours;
        private Integer currentHours;

        private String badgeImageUrl;
        private String clockImageUrl;
        private String templeImageUrl;
        private String primaryColor;
        private List<TotemSyncDTO> totems;
    }

    @Data
    @Builder
    public static class TotemSyncDTO {
        private Integer id;
        private String name;
        private String goalDescription;
        private ProgressData currentProgress;
        private Integer targetProgress;
        private String totemImageUrl;
        private Boolean isActive;
        private TypeOfGoal totemType;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ProgressData {
        private Integer progress;
        private String description;
    }

    // ==========================================
    // 4. CALENDAR
    // ==========================================
    @Data
    @Builder
    public static class CalendarEventSyncDTO {
        private Integer id;
        private String logo;
        private String linkedEntity;
        private String title;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String color;
    }

    // ==========================================
    // 5. GENERAL HEADER INFORMATION
    // ==========================================
    @Data
    @Builder
    public static class HeaderInformation {
        private String title;
        private String logo;
        private String value;
        private String custom;
    }
}