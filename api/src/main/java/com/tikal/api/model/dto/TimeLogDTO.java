package com.tikal.api.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimeLogDTO {
    private Integer id;
    private String initTime;
    private String endTime;
    private Long minutes;
    private String logo;
    private String color;
    private String taskName;
}
