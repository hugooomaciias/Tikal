package com.tikal.api.model.dto.project;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectDTO {
    private Integer id;
    private String name;
    private String description;
    private String logoUrl;
    private Boolean isGroupBased;
    private Integer teamId;
    private String teamName;
}