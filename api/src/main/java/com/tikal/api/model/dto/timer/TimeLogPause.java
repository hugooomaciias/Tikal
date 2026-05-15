package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TimeLogPause {
    private LocalDateTime endDateTime;
    private String activityDescription;
}
