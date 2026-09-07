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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("api/settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Operaciones para gestionar las preferencias y perfil del usuario")
@SecurityRequirement(name = "bearerAuth")
public class UserSettingsController {
    private final SettingsService settingsService;
    private final UserService userService;

    /**
     * GET /api/settings
     * Returns all settings for the logged-in user.
     */
    @Operation(summary = "Obtener mis ajustes", description = "Devuelve todas las configuraciones del usuario autenticado.")
    @GetMapping
    public ResponseEntity<UserSettingsDTO> getMySettings() {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings settings = settingsService.getSettingsByUserId(myId);

        UserSettingsDTO dto = settingsService.mapToDTO(settings);

        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/settings
     * Receives the complete JSON modified by the client and saves it.
     */
    @Operation(summary = "Actualizar ajustes", description = "Recibe el JSON completo modificado por el cliente y lo guarda.")
    @PutMapping
    public ResponseEntity<UserSettingsDTO> updateMySettings(@RequestBody UserSettingsDTO updatedSettings) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateSettings(myId, updatedSettings);

        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /api/settings/layout
     * Updates only the dashboard box positions.
     */
    @Operation(summary = "Actualizar disposición", description = "Actualiza únicamente la posición de los bloques del dashboard.")
    @PatchMapping("/layout")
    public ResponseEntity<UserSettingsDTO> updateLayout(@RequestBody LayoutsDashboardMetadata layout) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateLayout(myId, layout);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /api/settings/widget-preferences
     * Updates only the internal widget filters (e.g., hide projects).
     */
    @Operation(summary = "Actualizar preferencias de widgets", description = "Actualiza únicamente los filtros internos de los widgets (por ejemplo, ocultar proyectos).")
    @PatchMapping("/widget-preferences")
    public ResponseEntity<UserSettingsDTO> updateWidgetPreferences(@RequestBody WidgetPreferencesMetadata preferences) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateWidgetPreferences(myId, preferences);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /api/settings/notification-preferences
     * Updates only the notification preferences.
     */
    @Operation(summary = "Actualizar preferencias de notificación", description = "Actualiza únicamente las preferencias de notificación.")
    @PatchMapping("/notification-preferences")
    public ResponseEntity<UserSettingsDTO> updateNotificationPreferences(@RequestBody NotificationSettingsMetadata notificationPreferences) {
        Integer myId = userService.getAuthenticatedUserID();

        UserSettings savedSettings = settingsService.updateNotificationPreferences(myId, notificationPreferences);
        return ResponseEntity.ok(settingsService.mapToDTO(savedSettings));
    }

    /**
     * PATCH /api/settings/profile
     * Updates the user's profile information: name, email.
     */
    @Operation(summary = "Actualizar perfil", description = "Actualiza la información del perfil del usuario: nombre, email.")
    @PatchMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UpdateProfileRequest request) {
        Integer myId = userService.getAuthenticatedUserID();
        UserDTO updatedUser = userService.updateProfile(myId, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * POST /api/settings/profile/avatar
     * Updates the user's avatarImage uploading it to Cloudinary.
     */
    @Operation(summary = "Subir avatar", description = "Actualiza el avatar del usuario subiéndolo a Cloudinary.")
    @PostMapping("/profile/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(@RequestParam(value="file", required=false) MultipartFile file) {
        Integer userId = userService.getAuthenticatedUserID();
        UserDTO updatedUser = userService.updateAvatar(userId, file);
        return ResponseEntity.ok(updatedUser);
    }
}
