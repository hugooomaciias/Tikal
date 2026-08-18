package com.tikal.api.controller;

import com.tikal.api.model.dto.user.UpdateProfileRequest;
import com.tikal.api.model.dto.user.UserDTO;
import com.tikal.api.model.dto.user.UserSettingsDTO;
import com.tikal.api.model.entity.UserSettings;
import com.tikal.api.model.entity.metadata.LayoutsDashboardMetadata;
import com.tikal.api.model.entity.metadata.NotificationSettingsMetadata;
import com.tikal.api.model.entity.metadata.WidgetPreferencesMetadata;
import com.tikal.api.service.SettingsService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/settings")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<UserSettingsDTO> updateMySettings(@RequestBody UserSettingsDTO updatedSettings) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateSettings(myId, updatedSettings);

        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/layout
     * Updates only the dashboard box positions.
     */
    @PatchMapping("/layout")
    public ResponseEntity<UserSettingsDTO> updateLayout(@RequestBody LayoutsDashboardMetadata layout) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateLayout(myId, layout);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/widget-preferences
     * Updates only the internal widget filters (e.g., hide projects).
     */
    @PatchMapping("/widget-preferences")
    public ResponseEntity<UserSettingsDTO> updateWidgetPreferences(@RequestBody WidgetPreferencesMetadata preferences) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateWidgetPreferences(myId, preferences);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/notification-preferences
     * Updates only the notification preferences.
     */
    @PatchMapping("/notification-preferences")
    public ResponseEntity<UserSettingsDTO> updateNotificationPreferences(@RequestBody NotificationSettingsMetadata notificationPreferences) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateNotificationPreferences(myId, notificationPreferences);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /settings/profile
     * Updates the user's profile information: name, email.
     */
    @PatchMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UpdateProfileRequest request) {
        Integer myId = userService.getAuthenticatedUserID();
        UserDTO updatedUser = userService.updateProfile(myId, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * POST /settings/profile/avatar
     * Updates the user's avatarImage uploading it to Cloudinary.
     */
    @PostMapping("/profile/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Integer userId = userService.getAuthenticatedUserID();
        UserDTO updatedUser = userService.updateAvatar(userId, file);
        return ResponseEntity.ok(updatedUser);
    }
}
