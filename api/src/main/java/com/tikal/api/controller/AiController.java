package com.tikal.api.controller;

import com.tikal.api.model.dto.ai.AiMessageDTO;
import com.tikal.api.model.dto.ai.AiMessageRequest;
import com.tikal.api.model.dto.ai.AiNewChatResponse;
import com.tikal.api.model.dto.ai.AiSessionDTO;
import com.tikal.api.service.AiAdvisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "AI", description = "Endpoints relacionados con el asistente AI y sesiones de chat")
@SecurityRequirement(name = "bearerAuth")
public class AiController {
    /**
     * GET /api/ai/sessions
     * Returns all chat sessions for the logged-in user.
     */
    @Operation(summary = "Obtener sesiones", description = "Devuelve todas las sesiones de chat del usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de sesiones AI", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiSessionDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/sessions")
    public ResponseEntity<List<AiSessionDTO>> getMySessions() {
        return ResponseEntity.ok(aiAdvisorService.getSessions());
    }

    private final AiAdvisorService aiAdvisorService;

    /**
     * POST /api/ai/sessions
     * Creates a new empty chat session for the user.
     */
    @Operation(summary = "Crear sesión", description = "Crea una nueva sesión de chat vacía para el usuario.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sesión creada", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiSessionDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/sessions")
    public ResponseEntity<AiSessionDTO> createNewSession() {
        return ResponseEntity.ok(aiAdvisorService.createSession());
    }

    /**
     * GET /api/ai/sessions/{sessionId}/messages
     * Returns the message history for a specific session.
     */
    @Operation(summary = "Obtener mensajes de sesión", description = "Devuelve el historial de mensajes de una sesión de chat AI específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Página de mensajes de la sesión", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiMessageDTO.class))),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Page<AiMessageDTO>> getSessionMessages(
            @Parameter(description = "ID de la sesión AI", example = "3", in = ParameterIn.PATH) @PathVariable Integer sessionId,
            @Parameter(description = "Número de página (0-based)", example = "0", in = ParameterIn.QUERY) @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página", example = "20", in = ParameterIn.QUERY) @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(aiAdvisorService.getMessagesBySession(sessionId, page, size));
    }

    /**
     * PATCH /api/ai/sessions/{sessionId}
     * Updates the title of a specific session.
     */
    @Operation(summary = "Actualizar título de sesión", description = "Actualiza el título de una sesión de chat AI específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Título actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiSessionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Título inválido"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/sessions/{sessionId}")
    public ResponseEntity<AiSessionDTO> updateSessionTitle(
            @Parameter(description = "ID de la sesión AI", example = "3", in = ParameterIn.PATH) @PathVariable Integer sessionId,
            @Parameter(description = "Nuevo título de la sesión", example = "Planificación diaria", in = ParameterIn.QUERY) @RequestParam String title) {
        return ResponseEntity.ok(aiAdvisorService.setNewSessionName(sessionId, title));
    }

    /**
     * POST /api/ai/sessions/{sessionId}/message
     * Sends a new user message to the AI and returns the AI's response.
     */
    @Operation(summary = "Enviar mensaje al AI", description = "Envía un nuevo mensaje del usuario al AI y devuelve la respuesta del AI.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mensaje enviado y respuesta recibida", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiMessageDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/sessions/{sessionId}/message")
    public ResponseEntity<AiMessageDTO> sendMessage(
            @Parameter(description = "ID de la sesión AI", example = "3", in = ParameterIn.PATH) @PathVariable Integer sessionId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Payload con el contenido del usuario", required = true, content = @Content(schema = @Schema(implementation = AiMessageRequest.class))) @RequestBody Map<String, String> payload) {

        String userText = payload.get("content");
        return ResponseEntity.ok(aiAdvisorService.sendMessage(sessionId, userText));
    }

    /**
     * POST /api/ai/sessions/new-chat
     * Sends a new user message from a new session to the AI and returns the AI's response.
     */
    @Operation(summary = "Iniciar nuevo chat", description = "Inicia una nueva sesión de chat y envía el primer mensaje al AI, devolviendo la respuesta del AI.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Nuevo chat iniciado y respuesta del AI", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AiNewChatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/sessions/new-chat")
    public ResponseEntity<AiNewChatResponse> startNewChat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Contenido inicial del nuevo chat", required = true, content = @Content(schema = @Schema(implementation = AiMessageRequest.class))) @RequestBody AiMessageRequest request) {

        return ResponseEntity.ok(aiAdvisorService.startNewChat(request.getContent()));
    }

    /**
     * DELETE /api/ai/sessions/{sessionId}
     * Delete a chat session and all its messages.
     */
    @Operation(summary = "Eliminar sesión AI", description = "Elimina una sesión de chat y todos sus mensajes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Sesión eliminada (sin contenido)"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> startNewChat(
            @Parameter(description = "ID de la sesión a eliminar", example = "3", in = ParameterIn.PATH) @PathVariable Integer sessionId) {
        aiAdvisorService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
