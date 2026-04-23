package com.tikal.api.model.dto;

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
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
}
