package com.tikal.api.model.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogoutRequest {
    @JsonProperty("refresh_token")
    @Schema(description = "Refresh token JWT que se invalidará al cerrar sesión", example = "eyJhbGciOiJI...")
    private String refreshToken;
}
