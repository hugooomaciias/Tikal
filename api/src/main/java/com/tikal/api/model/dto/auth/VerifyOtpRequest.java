package com.tikal.api.model.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VerifyOtpRequest {
    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "Debe ser un formato de email válido")
    @Schema(description = "Email asociado al OTP", example = "fernando@example.com")
    private String email;

    @Schema(description = "Código OTP enviado por email", example = "123456")
    private String otpCode;
}