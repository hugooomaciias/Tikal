package com.tikal.api.exception;

import com.tikal.api.exception.dto.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.messaging.handler.annotation.support.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@ApiResponses(value = {
        @ApiResponse(
                responseCode = "4XX",
                description = "Errores de cliente (Ej: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found). Revisa el mensaje de error para más detalles.",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))
        )
})
public class GlobalExceptionHandler {

    // ==========================================
    // CONFLICT (HTTP 409)
    // ==========================================
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), ex.getCustomCode(), request);
    }

    // ==========================================
    // VALIDATION MANAGER @NotBlank, @NotNull... (HTTP 400)
    // ==========================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();

        // Extraction of each field which failed and the message
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Hay errores en los datos enviados.")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // ==========================================
    // GENERAL BAD REQUEST (HTTP 400)
    // ==========================================
    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null, request);
    }

    // ==========================================
    // RESOURCE NOT FOUND (HTTP 404)
    // ==========================================
    @ExceptionHandler({ResourceNotFoundException.class, UsernameNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleNotFound(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null, request);
    }

    // ==========================================
    // FORBIDDEN ACCESS (HTTP 403)
    // ==========================================
    @ExceptionHandler({AccessDeniedException.class, ForbiddenAccessException.class})
    public ResponseEntity<ErrorResponse> handleForbidden(Exception ex, HttpServletRequest request) {
        String message = ex instanceof AccessDeniedException
                ? "Tu plan actual no te permite acceder a esta función. Actualiza a COMUNITARIO."
                : ex.getMessage();
        return buildResponse(HttpStatus.FORBIDDEN, message, null, request);
    }

    // ==========================================
    // AUTHENTICATION ERRORS - 401 UNAUTHORIZED
    // ==========================================
    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class, ExpiredJwtException.class, SignatureException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorized(Exception ex, HttpServletRequest request) {

        String message = ex instanceof BadCredentialsException
                ? "La contraseña es incorrecta. Por favor, inténtalo de nuevo."
                : ex.getMessage();
        if (ex instanceof  ExpiredJwtException) {
            message = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.";
        } else if (ex instanceof SignatureException) {
            message = "El token proporcionado no es válido. Por favor, inicia sesión nuevamente.";
        }
        return buildResponse(HttpStatus.UNAUTHORIZED, message, null, request);
    }

    // ==========================================
    // BAD_FORM JSON OR INCORRECT TYPES - HTTP 400
    // ==========================================
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(Exception ex, HttpServletRequest request) {
        String message = "El formato de los datos enviados es incorrecto (revisa la sintaxis del JSON, fechas o tipos de datos).";
        return buildResponse(HttpStatus.BAD_REQUEST, message, null, request);
    }

    // ==========================================
    // CATCH-ALL: internal server errors (HTTP 500)
    // ==========================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllUncaughtExceptions(Exception ex, HttpServletRequest request) {
        // Print the stack trace in the server to debug
        ex.printStackTrace();

        String message = "Ha ocurrido un error inesperado en el servidor. Por favor, contacta con soporte.";
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, null, request);
    }

    // ==========================================
    //            AUXILIAR METHOD
    // ==========================================
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String customCode, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .customCode(customCode)
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(error, status);
    }
}
