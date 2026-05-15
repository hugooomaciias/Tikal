package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActiveTimerDTO {
    private Integer id;             // ID of the TimeLog if is running (null if is stopped or pauser)
    private String colour;           // Stage color
    private String logo;            // Project logo
    private LocalDateTime initDateTime; // Initial time, null if is stopped
    private Long accumulatedSeconds;     // Accumulated seconds in the latest pauses
    private String entityName;      // Task/Stage/Proyect name
}
