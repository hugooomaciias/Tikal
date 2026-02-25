package com.tikal.api.model.dto.auth;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
