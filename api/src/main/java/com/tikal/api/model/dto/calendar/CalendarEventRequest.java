package com.tikal.api.model.dto.calendar;

import com.tikal.api.model.entity.enumerated.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventRequest {

    @NotBlank
    private String name;
    private String description;
    @NotNull
    private Instant initDateTime;
    @NotNull
    private Instant endDateTime;
    private Boolean isActivateTracker;
    private String colour;
    @NotNull
    private EventType eventType;
    private Boolean isCompleteDay;

    // Relations (Opcional)
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
}
