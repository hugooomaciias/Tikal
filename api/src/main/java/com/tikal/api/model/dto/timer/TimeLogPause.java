package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogPause {
    private Instant endDateTime;
    private String activityDescription;
}
