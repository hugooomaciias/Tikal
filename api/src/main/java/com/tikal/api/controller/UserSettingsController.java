package com.tikal.api.controller;

import com.tikal.api.model.dto.UserDTO;
import com.tikal.api.model.dto.UserSettingsDTO;
import com.tikal.api.model.entity.UserSettings;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import com.tikal.api.service.SettingsService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class UserSettingsController {
    private final SettingsService settingsService;
    private final UserService userService;

    /**
     * GET /settings
     * Returns all settings for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<UserSettingsDTO> getMySettings() {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings settings = settingsService.getSettingsByUserId(myId);

        UserSettingsDTO dto = settingsService.mapToDTO(settings);

        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /settings
     * Receives the complete JSON modified by the client and saves it.
     */
    @PutMapping
    public ResponseEntity<UserSettingsDTO> updateMySettings(@RequestBody UserSettings updatedSettings) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateSettings(myId, updatedSettings);

        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/layout
     * Solo actualiza las posiciones de las cajas del dashboard.
     */
    @PatchMapping("/layout")
    public ResponseEntity<UserSettingsDTO> updateLayout(@RequestBody LayoutsDashboardMetadata layout) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateLayout(myId, layout);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/widget-preferences
     * Solo actualiza los filtros internos de los widgets (ej: ocultar proyectos).
     */
    @PatchMapping("/widget-preferences")
    public ResponseEntity<UserSettingsDTO> updateWidgetPreferences(@RequestBody WidgetPreferencesMetadata preferences) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateWidgetPreferences(myId, preferences);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }
}
