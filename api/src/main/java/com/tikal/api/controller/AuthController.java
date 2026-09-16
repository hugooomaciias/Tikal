package com.tikal.api.controller;

import com.tikal.api.model.dto.auth.*;
import com.tikal.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
    @ApiResponse(responseCode = "201", description = "Usuario registrado correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para registrar un nuevo usuario", required = true, content = @Content(schema = @Schema(implementation = RegisterRequest.class))) @RequestBody RegisterRequest request) {
        final TokenResponse token = service.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    /**
     * POST /auth/login
     * Authenticate a user and return an authentication token.
     */
    @Operation(summary = "Iniciar sesión", description = "Autentica a un usuario y devuelve los tokens JWT.")
    @ApiResponse(responseCode = "200", description = "Autenticación correcta", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Credenciales del usuario", required = true, content = @Content(schema = @Schema(implementation = LoginRequest.class))) @RequestBody LoginRequest request) {
        final TokenResponse token = service.login(request);
        return ResponseEntity.ok(token);
    }

    /**
     * POST /auth/refresh
     * Refresh access token using the Authorization header.
     */
    @Operation(summary = "Refrescar token", description = "Refresca el token de acceso usando el header Authorization que contiene el refresh token.")
    @ApiResponse(responseCode = "200", description = "Token refrescado correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            @Parameter(in = ParameterIn.HEADER, name = HttpHeaders.AUTHORIZATION, description = "Refresh token en el header Authorization. Formato: Bearer {refresh-token}", example = "Bearer eyJhbGciOiJI...") @RequestHeader(HttpHeaders.AUTHORIZATION) final String authHeader) {
        final TokenResponse token = service.refreshToken(authHeader);
        return ResponseEntity.ok(token);
    }

    /**
     * POST /auth/logout
     * Logout a single session by invalidating the provided refresh token.
     */
    @Operation(summary = "Cerrar sesión", description = "Cierra la sesión actual invalidando el refresh token proporcionado.")
    @ApiResponse(responseCode = "204", description = "Sesión cerrada correctamente (sin contenido)")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Refresh token para invalidar sesión", required = true, content = @Content(schema = @Schema(implementation = LogoutRequest.class))) @RequestBody LogoutRequest request) {
        service.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /auth/logout-all
     * Logout all sessions associated with the provided refresh token.
     */
    @Operation(summary = "Cerrar todas las sesiones", description = "Cierra todas las sesiones asociadas al refresh token proporcionado.")
    @ApiResponse(responseCode = "204", description = "Todas las sesiones cerradas correctamente (sin contenido)")
    @PostMapping("/logout-all")
    public  ResponseEntity<Void> logoutAll(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Refresh token para invalidar todas las sesiones", required = true, content = @Content(schema = @Schema(implementation = LogoutRequest.class))) @RequestBody LogoutRequest request) {
        service.logoutAll(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /auth/forgot-password
     * Initiate password reset process by sending a verification code to the user's email.
     */
    @Operation(summary = "Olvidé mi contraseña", description = "Inicia el proceso de restablecimiento de contraseña enviando un código de verificación al correo del usuario.")
    @ApiResponse(responseCode = "200", description = "Código OTP enviado al correo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MessageResponse.class)))
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
    @ApiResponse(responseCode = "200", description = "OTP verificado correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MessageResponse.class)))
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
    @ApiResponse(responseCode = "200", description = "Contraseña actualizada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MessageResponse.class)))
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos para restablecer la contraseña", required = true, content = @Content(schema = @Schema(implementation = ResetPasswordRequest.class))) @RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        MessageResponse message = MessageResponse.builder().message("Contraseña actualizada con éxito").build();
        return ResponseEntity.ok(message);
    }

    /**
     * POST /auth/google
     * Authenticate or register a user using Google ID token.
     */
    @Operation(summary = "Login con Google", description = "Autentica o registra un usuario usando un token de ID de Google.")
    @ApiResponse(responseCode = "200", description = "Autenticación con Google correcta", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/google")
    public ResponseEntity<TokenResponse> googleLogin(@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Payload con idToken de Google y preferencias", required = true, content = @Content(schema = @Schema(implementation = GoogleLoginRequest.class))) @RequestBody GoogleLoginRequest request) {
        TokenResponse response = service.loginWithGoogle(request.getIdToken(), request.getLanguage(), request.getTimeZone());
        return ResponseEntity.ok(response);
    }
}