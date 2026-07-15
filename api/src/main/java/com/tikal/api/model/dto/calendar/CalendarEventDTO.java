package com.tikal.api.model.dto.calendar;

import com.tikal.api.model.entity.enumerated.EventType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventDTO {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime initDateTime;
    private LocalDateTime endDateTime;
    private Boolean isActivateTracker;
    private String colour;
    private EventType eventType;
    private String logo;
    private String linkedEntity;
}
