package com.tikal.api.controller;

import com.tikal.api.model.dto.chat.ChatMessageDTO;
import com.tikal.api.model.dto.chat.ChatSummaryDTO;
import com.tikal.api.model.entity.Message;
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
    @GetMapping("/sidebar")
    public ResponseEntity<List<ChatSummaryDTO>> getSidebarChats(
            @RequestParam(required = false) String search) {
        Integer myId = userService.getAuthenticatedUser().getId();
        return ResponseEntity.ok(chatService.getMixedSidebar(myId, search));
    }

    /**
     * GET /api/chats/direct/{otherUserId}
     * Returns paginated direct chat history with another user. Marks the conversation as read for the caller.
     */
    @Operation(summary = "Historial de chat directo", description = "Devuelve el historial paginado de chat directo con otro usuario. Marca la conversación como leída para el llamador.")
    @GetMapping("/direct/{otherUserId}")
    public ResponseEntity<Page<ChatMessageDTO>> getDirectChatHistory(
            @PathVariable Integer otherUserId,
            @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markConversationAsRead(myId, otherUserId);

        return ResponseEntity.ok(chatService.getDirectChatHistoryPaginated(myId, otherUserId, pageable));
    }

    /**
     * GET /api/chats/team/{teamId}
     * Returns paginated team chat history and marks the team conversation as read for the caller.
     */
    @Operation(summary = "Historial de chat de equipo", description = "Devuelve el historial paginado de chat de equipo y marca la conversación del equipo como leída para el llamador.")
    @GetMapping("/team/{teamId}")
    public ResponseEntity<Page<ChatMessageDTO>> getTeamChatHistory(
            @PathVariable Integer teamId,
            @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markTeamConversationAsRead(myId, teamId);

        return ResponseEntity.ok(chatService.getTeamChatHistoryPaginated(teamId, pageable));
    }
}