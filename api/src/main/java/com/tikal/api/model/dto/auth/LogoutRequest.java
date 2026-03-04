package com.tikal.api.model.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogoutRequest {
    @JsonProperty("refresh_token")
    private String refreshToken;
}
