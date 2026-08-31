package com.tikal.api.model.dto.task;


import com.tikal.api.model.entity.enumerated.ProjectType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProjectDTO {
    private Integer id;
    private String name;
    private String description;
    private Instant deadline;
    private String logo;
    private Boolean isGroupBased;
    private Integer teamId;
    private String teamImage;
    private String teamName;
    private Boolean addToCalendar;
    private ProjectType type;
}