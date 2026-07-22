package com.tikal.api.model.dto.calendar;

import com.tikal.api.model.entity.enumerated.EventType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CalendarEventDTO {
    private Integer id;
    private String name;
    private String description;
    private Instant initDateTime;
    private Instant endDateTime;
    private Boolean isActivateTracker;
    private Boolean isCompleteDay;
    private String colour;
    private EventType eventType;
    private String logo;
    private String linkedEntity;
}
