package com.tikal.api.model.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenResponse {

    @JsonProperty("access_token") //It's for the name of the Json sended
    @Schema(description = "Access token JWT (short lived)", example = "eyJhbGciOiJIUzI1NiIsInR...")
    private String accessToken;

    @JsonProperty("refresh_token")
    @Schema(description = "Refresh token JWT (long lived)", example = "eyJhbGciOiJIUzI1NiIsInR...")
    private String refreshToken;
}