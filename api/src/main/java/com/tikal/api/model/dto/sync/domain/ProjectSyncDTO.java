package com.tikal.api.model.dto.sync.domain;

import com.tikal.api.model.entity.enumerated.ProjectType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectSyncDTO {
    private Integer id;
    private String name;
    private String description;
    private Instant deadline;
    private String logo;
    private Boolean addToCalendar;
    private ProjectType type;
    private List<StageSyncDTO> stages;
}
