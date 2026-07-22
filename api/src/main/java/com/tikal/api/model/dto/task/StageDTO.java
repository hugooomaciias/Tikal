package com.tikal.api.model.dto.task;

import com.tikal.api.model.entity.enumerated.ProjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageDTO {
    private Integer id;
    private String name;
    private String description;
    private String colour;
    private Instant deadline;
    private Integer totalLoggedMinutes;
    private Integer templeLoggedMinutes;
    private String logo;
    private Boolean addToCalendar;
    private ProjectType type;
}
