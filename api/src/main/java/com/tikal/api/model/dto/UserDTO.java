package com.tikal.api.model.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private String avatarUrl;
    private String rangeTitle;
    private Integer currentLevel;
}
