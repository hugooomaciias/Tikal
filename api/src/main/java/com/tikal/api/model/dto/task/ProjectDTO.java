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
    private String logoUrl;
    private Boolean isGroupBased;
    private Integer teamId;
    private String teamName;
}