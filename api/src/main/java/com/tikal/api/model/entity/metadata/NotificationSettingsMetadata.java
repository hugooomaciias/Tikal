package com.tikal.api.model.entity.metadata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsMetadata implements Serializable {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Configuración de notificaciones por email")
    private EmailSettings email = new EmailSettings();

    @io.swagger.v3.oas.annotations.media.Schema(description = "Configuración de notificaciones internas (in-app)")
    private InAppSettings inApp = new InAppSettings();

    @io.swagger.v3.oas.annotations.media.Schema(description = "Configuración de notificaciones push")
    private PushSettings push = new PushSettings();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailSettings implements Serializable {
        @io.swagger.v3.oas.annotations.media.Schema(description = "Enviar resumen semanal por email", example = "true")
        private Boolean weeklySummary = true;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Recibir invitaciones a equipos por email", example = "true")
        private Boolean teamInvites = true;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Recibir comunicaciones de marketing por email", example = "false")
        private Boolean marketing = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InAppSettings implements Serializable {
        @io.swagger.v3.oas.annotations.media.Schema(description = "Recibir notificaciones por menciones en el chat", example = "true")
        private Boolean chatMentions = true;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Recibir notificaciones por asignaciones de tareas", example = "true")
        private Boolean taskAssignments = true;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Habilitar sonido en notificaciones in-app", example = "true")
        private Boolean soundEnabled = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushSettings implements Serializable {
        @io.swagger.v3.oas.annotations.media.Schema(description = "Notificar fin de Temple Mode vía push", example = "true")
        private Boolean templeModeEnd = true;
    }
}
