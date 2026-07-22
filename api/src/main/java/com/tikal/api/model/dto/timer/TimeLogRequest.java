package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogRequest {
    private Instant initDateTime;
    private Instant endDateTime;
    private Integer targetTime;
    private Boolean isTempleMode;
    private String activityDescription;
    private Boolean isCompleted;
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
}
