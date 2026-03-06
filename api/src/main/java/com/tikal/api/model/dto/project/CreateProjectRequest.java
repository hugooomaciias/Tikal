package com.tikal.api.model.dto.project;

import lombok.Data;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private String logoUrl;
    private Boolean isGroupBased;
    private Integer teamId;
}