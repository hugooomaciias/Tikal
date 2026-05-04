package com.tikal.api.model.dto.task;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectDTO {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime deadline;
    private String logo;
    private Boolean isGroupBased;
    private Integer teamId;
    private String teamName;
    private Boolean addToCalendar;
}