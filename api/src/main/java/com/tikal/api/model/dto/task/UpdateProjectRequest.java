package com.tikal.api.model.dto.task;

import com.tikal.api.model.entity.enumerated.ProjectType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    private String name;
    private String description;
    private Instant deadline;
    private String logo;
    private Boolean addToCalendar;
    private ProjectType type;
}