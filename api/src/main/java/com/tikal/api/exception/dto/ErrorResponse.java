package com.tikal.api.exception.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "ErrorResponse", description = "Estructura estándar de respuesta de error devuelta por la API.")
public class ErrorResponse {
    @Schema(description = "Fecha y hora en la que se produjo el error.", example = "2026-09-14T12:34:56.789")
    private LocalDateTime timestamp;

    @Schema(description = "Código HTTP del error.", example = "404")
    private Integer status;

    @Schema(description = "Descripción del estado HTTP en texto plano.", example = "Not Found")
    private String error;

    @Schema(description = "Mensaje descriptivo del error devuelto por la aplicación.", example = "No se ha encontrado ningún proyecto con el ID 14.")
    private String message;

    @Schema(description = "Ruta HTTP que provocó el error.", example = "/api/project/14")
    private String path;

    @Schema(description = "Código personalizado asociado a errores específicos de dominio, si aplica.", example = "PROJECT_NOT_FOUND")
    private String customCode;

    @Schema(description = "Mapa con los campos que fallan en validaciones y sus mensajes asociados.", example = "{\"email\":\"El email es obligatorio\"}")
    private Map<String, String> validationErrors;
}