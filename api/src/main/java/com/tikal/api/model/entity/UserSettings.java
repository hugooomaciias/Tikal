package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerated.*;

import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * This class represents the User Settings entity. It maps to the user_settings
 * table in the database and manages the personalized configuration for each
 * user, including interface themes, productivity goals, and dashboard layout
 * preferences.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "user_settings")
public class UserSettings {
    /* --- User relation ==> Many settings can belong to the same User --- */
    @Id
    @Column(name = "user_id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    /* --- Theme setting --- */
    @Enumerated(EnumType.STRING)
    @Column(name = "theme_setting", columnDefinition = "ENUM('CLARO', 'OSCURO', 'MAYA') DEFAULT 'MAYA'")
    private ThemeSetting theme = ThemeSetting.MAYA;

    /* --- Here we have the widgets position setting of the User --- */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layouts_dashboards")
    private LayoutsDashboardMetadata layoutsDashboards;

    /* --- Here we have how boxes behave inside --- */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "widget_preferences")
    private WidgetPreferencesMetadata widgetPreferences;

    /* --- Time range setting --- */
    @Enumerated(EnumType.STRING)
    @Column(name = "time_range", columnDefinition = "ENUM('SEMANAL', 'MENSUAL', 'TRIMESTRAL', 'ANUAL') DEFAULT 'SEMANAL'")
    private TimeRangeSetting timeRange = TimeRangeSetting.SEMANAL;

    /* --- Goal of hours to work --- */
    @Column(name = "hours_goal", columnDefinition = "INT DEFAULT 40")
    private Integer hoursGoal = 40;

    /* --- Default time on temple mode --- */
    @Column(name = "focus_session_minutes", columnDefinition = "INT DEFAULT 25")
    private Integer focusSessionMinutes = 25;

    /* --- JSON configuration for user notification preferences --- */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_settings")
    private NotificationSettingsMetadata notificationSettings;

    /* --- Visibility of user ranking within team members --- */
    @Column(name = "show_rank_in_team", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean showRankInTeam = true;

    /* --- User's preferred timezone for date/time display --- */
    @Column(name = "timezone", length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'UTC'")
    private String timezone = "UTC";

    /* --- First day of week setting for calendar views --- */
    @Enumerated(EnumType.STRING)
    @Column(name = "first_day_of_week", columnDefinition = "ENUM('LUNES', 'DOMINGO') DEFAULT 'LUNES'")
    private DayOfWeekSetting firstDayOfWeek = DayOfWeekSetting.LUNES;
}
