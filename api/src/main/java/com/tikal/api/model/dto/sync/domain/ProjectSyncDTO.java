package com.tikal.api.model.dto.sync.domain;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectSyncDTO {
    private Integer id;
    private String name;
    private String logo;
    private String description;
    private LocalDateTime deadline;
    private Boolean addToCalendar;
    private List<StageSyncDTO> stages;
}
