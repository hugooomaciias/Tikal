package com.tikal.api.model.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
}
