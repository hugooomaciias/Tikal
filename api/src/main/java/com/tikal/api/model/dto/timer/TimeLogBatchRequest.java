package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TimeLogBatchRequest {
    private Integer id;
    private LocalDateTime endDateTime;
    private String activityDescription;
}
