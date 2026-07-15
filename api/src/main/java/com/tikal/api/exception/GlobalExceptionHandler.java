package com.tikal.api.exception;

import com.tikal.api.exception.dto.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
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
    // 3. FORBIDDEN ACCESS (HTTP 403)
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
