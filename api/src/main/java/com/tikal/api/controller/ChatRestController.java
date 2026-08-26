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

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    private final UserService userService;

    // ==========================================
    // 1. SIDEBAR (Mixed Sidebar)
    // ==========================================
    @GetMapping("/sidebar")
    public ResponseEntity<List<ChatSummaryDTO>> getSidebarChats(
            @RequestParam(required = false) String search) {
        Integer myId = userService.getAuthenticatedUser().getId();
        return ResponseEntity.ok(chatService.getMixedSidebar(myId, search));
    }

    // ==========================================
    // 2. HISTORY PAGINATED (when you click a chat)
    // ==========================================
    @GetMapping("/direct/{otherUserId}")
    public ResponseEntity<Page<ChatMessageDTO>> getDirectChatHistory(
            @PathVariable Integer otherUserId,
            @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markConversationAsRead(myId, otherUserId);

        return ResponseEntity.ok(chatService.getDirectChatHistoryPaginated(myId, otherUserId, pageable));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<Page<ChatMessageDTO>> getTeamChatHistory(
            @PathVariable Integer teamId,
            @PageableDefault(size = 20, sort = "sendDate", direction = Sort.Direction.DESC) Pageable pageable) {

        Integer myId = userService.getAuthenticatedUser().getId();
        chatService.markTeamConversationAsRead(myId, teamId);

        return ResponseEntity.ok(chatService.getTeamChatHistoryPaginated(teamId, pageable));
    }
}