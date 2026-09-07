package com.tikal.api.controller;

import com.tikal.api.model.dto.auth.*;
import com.tikal.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticación y gestión de sesiones")
public class AuthController {
    private final AuthService service;

    /**
     * POST /auth/register
     * Register a new user and return an authentication token.
     */
    @Operation(summary = "Registrar usuario", description = "Registra un nuevo usuario y devuelve un token de autenticación.")
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody RegisterRequest request) {
        final TokenResponse token = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    /**
     * POST /auth/login
     * Authenticate a user and return an authentication token.
     */
    @Operation(summary = "Iniciar sesión", description = "Autentica a un usuario y devuelve los tokens JWT.")
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        final TokenResponse token = service.login(request);
        return ResponseEntity.ok(token);
    }

    /**
     * POST /auth/refresh
     * Refresh access token using the Authorization header.
     */
    @Operation(summary = "Refrescar token", description = "Refresca el token de acceso usando el header Authorization que contiene el refresh token.")
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            @RequestHeader(HttpHeaders.AUTHORIZATION) final String authHeader) {
        final TokenResponse token = service.refreshToken(authHeader);
        return ResponseEntity.ok(token);
    }

    /**
     * POST /auth/logout
     * Logout a single session by invalidating the provided refresh token.
     */
    @Operation(summary = "Cerrar sesión", description = "Cierra la sesión actual invalidando el refresh token proporcionado.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        service.logout(request.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /auth/logout-all
     * Logout all sessions associated with the provided refresh token.
     */
    @Operation(summary = "Cerrar todas las sesiones", description = "Cierra todas las sesiones asociadas al refresh token proporcionado.")
    @PostMapping("/logout-all")
    public  ResponseEntity<Void> logoutAll(@RequestBody LogoutRequest request) {
        service.logoutAll(request.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /auth/forgot-password
     * Initiate password reset process by sending a verification code to the user's email.
     */
    @Operation(summary = "Olvidé mi contraseña", description = "Inicia el proceso de restablecimiento de contraseña enviando un código de verificación al correo del usuario.")
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request);
        MessageResponse message = MessageResponse.builder().message("Se ha enviado un código a tu correo").build();
        return ResponseEntity.ok(message);
    }

    /**
     * POST /auth/verify-otp
     * Verify the OTP code received by email to allow password resetting.
     */
    @Operation(summary = "Verificar OTP", description = "Verifica el código OTP recibido por correo para permitir el restablecimiento de la contraseña.")
    @PostMapping("/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        service.verifyOtp(request);
        MessageResponse message = MessageResponse.builder().message("Código verificado correctamente").build();
        return ResponseEntity.ok(message);
    }

    /**
     * POST /auth/reset-password
     * Permanently change the user's password after OTP verification.
     */
    @Operation(summary = "Restablecer contraseña", description = "Cambia permanentemente la contraseña del usuario tras la verificación OTP.")
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        MessageResponse message = MessageResponse.builder().message("Contraseña actualizada con éxito").build();
        return ResponseEntity.ok(message);
    }

    /**
     * POST /auth/google
     * Authenticate or register a user using Google ID token.
     */
    @Operation(summary = "Login con Google", description = "Autentica o registra un usuario usando un token de ID de Google.")
    @PostMapping("/google")
    public ResponseEntity<TokenResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        TokenResponse response = service.loginWithGoogle(request.getIdToken(), request.getLanguage(), request.getTimeZone());
        return ResponseEntity.ok(response);
    }
}
