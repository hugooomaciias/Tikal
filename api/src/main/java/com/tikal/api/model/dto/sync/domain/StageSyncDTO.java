package com.tikal.api.model.dto.sync.domain;

import com.tikal.api.model.dto.sync.WorkspaceSyncDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class StageSyncDTO {
    private Integer id;
    private String name;
    private String description;
    private String colour;
    private LocalDateTime deadline;
    private List<TaskSyncDTO> tasks;
}
