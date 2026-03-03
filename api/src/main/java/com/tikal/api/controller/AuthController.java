package com.tikal.api.controller;

import com.tikal.api.model.dto.auth.LoginRequest;
import com.tikal.api.model.dto.auth.LogoutRequest;
import com.tikal.api.model.dto.auth.RegisterRequest;
import com.tikal.api.model.dto.auth.TokenResponse;
import com.tikal.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.antlr.runtime.Token;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody RegisterRequest request) {
        final TokenResponse token = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        final TokenResponse token = service.login(request);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            @RequestHeader(HttpHeaders.AUTHORIZATION) final String authHeader) {
        final TokenResponse token = service.refreshToken(authHeader);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        service.logout(request.getRefreshToken());
        return ResponseEntity.ok().build();
    }
}
