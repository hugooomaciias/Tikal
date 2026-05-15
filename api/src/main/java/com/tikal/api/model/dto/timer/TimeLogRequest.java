package com.tikal.api.model.dto.timer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TimeLogRequest {
    private LocalDateTime initDateTime;
    private LocalDateTime endDateTime;
    private Integer targetTime;
    private Boolean isTempleMode;
    private String activityDescription;
    private Boolean isCompleted;
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
}
