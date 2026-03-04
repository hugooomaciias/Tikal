package com.tikal.api.model.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String subscriptionPlan;
}
