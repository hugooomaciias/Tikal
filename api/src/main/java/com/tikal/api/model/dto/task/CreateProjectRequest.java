package com.tikal.api.model.dto.task;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private LocalDateTime deadline;
    private Boolean isGroupBased;
    private Integer teamId;
    private String logo;
    private Boolean addToCalendar;
}