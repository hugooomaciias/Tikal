package com.tikal.api.model.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "Debe ser un formato de email válido")
    @Schema(description = "Email del usuario que solicita el cambio de contraseña", example = "fernando@example.com")
    private String email;

    @Schema(description = "Código OTP previamente enviado al correo", example = "123456")
    private String otpCode;

    @Schema(description = "Nueva contraseña a establecer", example = "NewP@ssw0rd!")
    private String newPassword;
}