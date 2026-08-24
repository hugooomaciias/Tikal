package com.tikal.api.model.dto.auth;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String idToken;
    private String timeZone;
    private String language;
}
