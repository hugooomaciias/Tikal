package com.tikal.api.model.entity.metadata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsMetadata implements Serializable {
    private EmailSettings email = new EmailSettings();
    private InAppSettings inApp = new InAppSettings();
    private PushSettings push = new PushSettings();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmailSettings implements Serializable {
        private Boolean weeklySummary = true;
        private Boolean teamInvites = true;
        private Boolean marketing = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InAppSettings implements Serializable {
        private Boolean chatMentions = true;
        private Boolean taskAssignments = true;
        private Boolean soundEnabled = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushSettings implements Serializable {
        private Boolean templeModeEnd = true;
    }
}
