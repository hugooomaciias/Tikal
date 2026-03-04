package com.tikal.api.model.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginRequest {
    /* --- This attribute could be the name or the email of the user --- */
    private String identifier;
    private String password;
}