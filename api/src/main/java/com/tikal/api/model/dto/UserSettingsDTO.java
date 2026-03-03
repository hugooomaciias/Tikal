package com.tikal.api.model.dto;

import com.tikal.api.model.entity.enumerated.DayOfWeekSetting;
import com.tikal.api.model.entity.enumerated.ThemeSetting;
import com.tikal.api.model.entity.enumerated.TimeRangeSetting;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserSettingsDTO {

    // --- General Settings ---
    private ThemeSetting theme;
    private TimeRangeSetting timeRange;
    private Integer hoursGoal;
    private Integer focusSessionMinutes;
    private String timezone;
    private DayOfWeekSetting firstDayOfWeek;
    private Boolean showRankInTeam;

    // --- JSON metadata ---
    private LayoutsDashboardMetadata layoutsDashboards;
    private WidgetPreferencesMetadata widgetPreferences;
    private NotificationSettingsMetadata notificationSettings;
}