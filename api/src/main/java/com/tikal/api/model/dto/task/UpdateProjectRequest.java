package com.tikal.api.model.dto.task;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    private String name;
    private String description;
    private LocalDateTime deadline;
    private String logoUrl;
}