package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogBatchRequest {
    private Integer id;
    private Instant endDateTime;
    private String activityDescription;
}
