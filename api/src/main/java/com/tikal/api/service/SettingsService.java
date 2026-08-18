package com.tikal.api.service;

import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.model.dto.user.UserSettingsDTO;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.UserSettings;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import com.tikal.api.repository.UserRepository;
import com.tikal.api.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {
    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    /**
     * Get the configuration. If it does not exist, create a default one.
     */
    public UserSettings getSettingsByUserId(Integer userId) {
        return settingsRepository.findById(userId).orElseGet(() -> createDefaultConfiguration(userId));
    }

    /**
     * Update ALL settings at once.
     */
    public UserSettings updateSettings(Integer userId, UserSettingsDTO newSettings) {
        UserSettings currentSettings = getSettingsByUserId(userId);

        if (newSettings.getTheme() != null) currentSettings.setTheme(newSettings.getTheme());
        if (newSettings.getTimeRange() != null) currentSettings.setTimeRange(newSettings.getTimeRange());
        if (newSettings.getHoursGoal() != null) currentSettings.setHoursGoal(newSettings.getHoursGoal());
        if (newSettings.getFocusSessionMinutes() != null) currentSettings.setFocusSessionMinutes(newSettings.getFocusSessionMinutes());
        if (newSettings.getTimezone() != null) currentSettings.setTimezone(newSettings.getTimezone());
        if (newSettings.getFirstDayOfWeek() != null) currentSettings.setFirstDayOfWeek(newSettings.getFirstDayOfWeek());
        if (newSettings.getShowRankInTeam() != null) currentSettings.setShowRankInTeam(newSettings.getShowRankInTeam());

        if (newSettings.getLayoutsDashboards() != null) {
            currentSettings.setLayoutsDashboards(newSettings.getLayoutsDashboards());
        }
        if (newSettings.getWidgetPreferences() != null) {
            currentSettings.setWidgetPreferences(newSettings.getWidgetPreferences());
        }
        if (newSettings.getNotificationSettings() != null) {
            currentSettings.setNotificationSettings(newSettings.getNotificationSettings());
        }

        return settingsRepository.save(currentSettings);
    }

    // --- Auxiliary method ---
    private UserSettings createDefaultConfiguration(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado ningún usuario con esas credenciales"));

        UserSettings defaults = new UserSettings();
        defaults.setUser(user);

        defaults.setLayoutsDashboards(new LayoutsDashboardMetadata());
        defaults.setWidgetPreferences(new WidgetPreferencesMetadata());
        defaults.setNotificationSettings(new NotificationSettingsMetadata());

        return settingsRepository.save(defaults);
    }

    /**
     * Convierte la entidad de Base de Datos en un DTO seguro para el Frontend.
     */
    public UserSettingsDTO mapToDTO(UserSettings entity) {
        UserSettingsDTO dto = new UserSettingsDTO();

        dto.setTheme(entity.getTheme());
        dto.setTimeRange(entity.getTimeRange());
        dto.setHoursGoal(entity.getHoursGoal());
        dto.setFocusSessionMinutes(entity.getFocusSessionMinutes());
        dto.setTimezone(entity.getTimezone());
        dto.setFirstDayOfWeek(entity.getFirstDayOfWeek());
        dto.setShowRankInTeam(entity.getShowRankInTeam());
        dto.setUserLanguage(entity.getUserLanguage());

        dto.setLayoutsDashboards(entity.getLayoutsDashboards());
        dto.setWidgetPreferences(entity.getWidgetPreferences());
        dto.setNotificationSettings(entity.getNotificationSettings());

        return dto;
    }

    /**
     * Update ONLY the layout of the dashboards
     */
    public UserSettings updateLayout(Integer userId, LayoutsDashboardMetadata newLayout) {
        UserSettings current = getSettingsByUserId(userId);
        LayoutsDashboardMetadata currentLayout = current.getLayoutsDashboards();

        LayoutsDashboardMetadata saveLayout = LayoutsDashboardMetadata.builder()
                .home(newLayout.getHome() != null ? newLayout.getHome() : currentLayout.getHome())
                .statistics(newLayout.getStatistics() != null ? newLayout.getStatistics() : currentLayout.getStatistics())
                .team(newLayout.getTeam() != null ? newLayout.getTeam() : currentLayout.getTeam())
                .build();
        current.setLayoutsDashboards(saveLayout);
        return settingsRepository.save(current);
    }

    /**
     * Update ONLY the widget preferences
     */
    public UserSettings updateWidgetPreferences(Integer userId, WidgetPreferencesMetadata newPreferences) {
        UserSettings current = getSettingsByUserId(userId);
        current.setWidgetPreferences(newPreferences);
        return settingsRepository.save(current);
    }

    /**
     * Update ONLY the notifications preferences
     */
    public UserSettings updateNotificationPreferences(Integer userId, NotificationSettingsMetadata notificationPreferences) {
        UserSettings current = getSettingsByUserId(userId);
        current.setNotificationSettings(notificationPreferences);
        return settingsRepository.save(current);
    }
}
