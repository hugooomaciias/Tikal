package com.tikal.api.model.dto.sync;

import com.tikal.api.model.dto.user.UserSettingsDTO;
import com.tikal.api.model.dto.calendar.CalendarEventDTO;
import com.tikal.api.model.dto.sync.domain.GamificationEventDTO;
import com.tikal.api.model.dto.sync.domain.ProjectSyncDTO;
import com.tikal.api.model.dto.sync.widgets.WidgetData;
import com.tikal.api.model.entity.enumerated.TypeOfGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class WorkspaceSyncDTO {

    private UserProfileSyncDTO userProfile;
    private UserSettingsDTO settings;
    private TempleSyncDTO templeMode;
    private List<CalendarEventDTO> calendarEvents;

    private List<HeaderInformation> homeGeneralInformation;
    private Map<String, WidgetData> homeWidgetsData;

    private List<HeaderInformation> statisticsGeneralInformation;
    private Map<String, WidgetData> statisticsWidgetsData;

    private List<GamificationEventDTO> gamificationEvents;

    private List<ProjectSyncDTO> tasks;

    // ==========================================
    // 1. USER PROFILE
    // ==========================================
    @Data
    @Builder
    public static class UserProfileSyncDTO {
        private Integer id;
        private String name;
        private String email;
        private String avatarUrl;
        private String subscriptionPlan;
        private Boolean tikalTutorialCompleted;
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
        private Integer targetProgress1;
        private Integer targetProgress2;
        private String totemImageUrl;
        private Boolean isActive;
        private Boolean justUnlocked;
        private TypeOfGoal totemType;
        private Integer rank;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ProgressData {
        private Integer progress1;
        private Integer progress2;
        private String description1;
        private String description2;
    }

    // ==========================================
    // 4. GENERAL HEADER INFORMATION
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