package com.tikal.api.service;

import com.tikal.api.exception.NotFoundUserException;
import com.tikal.api.model.dto.UserSettingsDTO;
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

        currentSettings.setTheme(newSettings.getTheme());
        currentSettings.setTimeRange(newSettings.getTimeRange());
        currentSettings.setHoursGoal(newSettings.getHoursGoal());
        currentSettings.setFocusSessionMinutes(newSettings.getFocusSessionMinutes());
        currentSettings.setTimezone(newSettings.getTimezone());
        currentSettings.setFirstDayOfWeek(newSettings.getFirstDayOfWeek());
        currentSettings.setShowRankInTeam(newSettings.getShowRankInTeam());

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
                .orElseThrow(NotFoundUserException::new);

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
        current.setLayoutsDashboards(newLayout);
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
