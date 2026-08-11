package com.tikal.api.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeLogDTO {
    private Integer id;
    private Instant initDateTime;
    private Instant endDateTime;
    private Integer projectId;
    private Integer stageId;
    private Integer taskId;
    private Integer minutes;
    private String logo;
    private String color;
    private String taskName;
    private String activityDescription;
}
