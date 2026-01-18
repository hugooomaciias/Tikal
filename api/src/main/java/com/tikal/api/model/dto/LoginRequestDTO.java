package com.tikal.api.model.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String name;
    private String email;
    private String password;
}
