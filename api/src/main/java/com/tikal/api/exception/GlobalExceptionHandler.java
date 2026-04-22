package com.tikal.api.exception;

import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // Conflict 409: conflicts with the current rules of the database
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleResourceAlreadyExists(ResourceAlreadyExistsException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getErrorCode());
        errorResponse.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // Bad request 400: the client is not sending the information correctly
    @ExceptionHandler({InvalidUserPlanException.class, IllegalArgumentException.class, IllegalOtpException.class,
            MethodArgumentNotValidException.class, TeamBadRequestException.class})
    public ResponseEntity<Map<String, String>> handleInvalidArgumentFromClient(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid data");
        error.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Not found 404: what the client is looking for doesn't exist on the database
    @ExceptionHandler({NotFoundUserException.class, UsernameNotFoundException.class, NotFoundProjectException.class,
            NotFoundTeamMemberException.class, NotFoundRankException.class, NotFoundStageException.class,
            NotFoundTaskException.class})
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Not found");
        errorResponse.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // Unauthorized 401: I don't know who you are or the token is revoked/expired
    @ExceptionHandler({InvalidTokenException.class, WrongOtpException.class})
    public ResponseEntity<Map<String, String>> handleUnauthorized(RuntimeException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Authentication failed");
        errorResponse.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, String>> handleExpiredJwtException(ExpiredJwtException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Token expired");
        errorResponse.put("message", "El token de acceso ha caducado. Actualice su sesión.");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Authentication failed");
        error.put("message", "La contraseña es incorrecta. Por favor, inténtalo de nuevo.");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Forbidden 403: I know who you are, but you are not authorized to access
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access denied");
        error.put("message", "Tu plan actual no te permite acceder a esta función. Actualiza a COMUNITARIO.");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(ProjectAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(ProjectAccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access denied");
        error.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
}
