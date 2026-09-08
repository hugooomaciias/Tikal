package com.tikal.api.controller;

import com.tikal.api.model.dto.chat.ChatMessageDTO;
import com.tikal.api.model.dto.chat.ChatSummaryDTO;
// ...existing code... (removed unused import Message)
import com.tikal.api.service.ChatService;
import com.tikal.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@Tag(name = "Chats", description = "Operaciones REST para chats directos y de equipo")
@SecurityRequirement(name = "bearerAuth")
public class ChatRestController {

    private final ChatService chatService;
    private final UserService userService;

    /**
     * GET /api/chats/sidebar
     * Returns the mixed sidebar (direct + team chats) for the authenticated user. Optional search filter.
     */
    @Operation(summary = "Obtener chats de la barra lateral", description = "Devuelve la barra lateral mixta (chats directos + de equipo) para el usuario autenticado. Parámetro opcional 'search' para filtrar.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de resúmenes de chat", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatSummaryDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/sidebar")
    public ResponseEntity<List<ChatSummaryDTO>> getSidebarChats(
            @Parameter(description = "Texto para filtrar los chats", example = "María", in = ParameterIn.QUERY) @RequestParam(required = false) String search) {
        Integer myId = userService.getAuthenticatedUser().getId();
        return ResponseEntity.ok(chatService.getMixedSidebar(myId, search));
    }

    /**
     * GET /api/chats/direct/{otherUserId}
     * Returns paginated direct chat history with another user. Marks the conversation as read for the caller.
     */
    @Operation(summary = "Historial de chat directo", description = "Devuelve el historial paginado de chat directo con otro usuario. Marca la conversación como leída para el llamador.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Página de mensajes directos", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatMessageDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/direct/{otherUserId}")
    public ResponseEntity<Page<ChatMessageDTO>> getDirectChatHistory(
            @Parameter(description = "ID del otro usuario", example = "45", in = ParameterIn.PATH) @PathVariable Integer otherUserId,
            @Parameter(description = "Paginación (page,size,sort)") @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markConversationAsRead(myId, otherUserId);

        return ResponseEntity.ok(chatService.getDirectChatHistoryPaginated(myId, otherUserId, pageable));
    }

    /**
     * GET /api/chats/team/{teamId}
     * Returns paginated team chat history and marks the team conversation as read for the caller.
     */
    @Operation(summary = "Historial de chat de equipo", description = "Devuelve el historial paginado de chat de equipo y marca la conversación del equipo como leída para el llamador.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Página de mensajes de equipo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatMessageDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/team/{teamId}")
    public ResponseEntity<Page<ChatMessageDTO>> getTeamChatHistory(
            @Parameter(description = "ID del equipo", example = "7", in = ParameterIn.PATH) @PathVariable Integer teamId,
            @Parameter(description = "Paginación (page,size,sort)") @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markTeamConversationAsRead(myId, teamId);

        return ResponseEntity.ok(chatService.getTeamChatHistoryPaginated(teamId, pageable));
    }
}