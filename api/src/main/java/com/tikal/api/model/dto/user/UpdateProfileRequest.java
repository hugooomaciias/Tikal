package com.tikal.api.model.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
}
