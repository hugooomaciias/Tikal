package com.tikal.api.model.dto.calendar;

import com.tikal.api.model.entity.enumerated.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventRequest {

    @NotBlank
    private String name;
    private String description;
    @NotNull
    private LocalDateTime initDateTime;
    @NotNull
    private LocalDateTime endDateTime;
    private Boolean isActivateTracker;
    private String customColour;
    @NotNull
    private EventType eventType;

    // Relations (Opcional)
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
}
