package com.tikal.api.model.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageRequest {
    private String name;
    private String description;
    private String colour;
    private Instant deadline;
    private Integer projectId;
    private Boolean addToCalendar;
}
