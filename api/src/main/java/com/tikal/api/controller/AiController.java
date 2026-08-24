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

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiController {
    private final AiAdvisorService aiAdvisorService;

    /**
     * GET /api/ai/sessions
     * Returns all chat sessions for the logged-in user.
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<AiSessionDTO>> getMySessions() {
        return ResponseEntity.ok(aiAdvisorService.getSessions());
    }

    /**
     * POST /api/ai/sessions
     * Creates a new empty chat session for the user.
     */
    @PostMapping("/sessions")
    public ResponseEntity<AiSessionDTO> createNewSession() {
        return ResponseEntity.ok(aiAdvisorService.createSession());
    }

    /**
     * GET /api/ai/sessions/{sessionId}/messages
     * Returns the message history for a specific session.
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Page<AiMessageDTO>> getSessionMessages(
            @PathVariable Integer sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(aiAdvisorService.getMessagesBySession(sessionId, page, size));
    }

    /**
     * PATCH /api/ai/sessions/{sessionId}
     * Updates the title of a specific session.
     */
    @PatchMapping("/sessions/{sessionId}")
    public ResponseEntity<AiSessionDTO> updateSessionTitle(
            @PathVariable Integer sessionId,
            @RequestParam String title) {
        return ResponseEntity.ok(aiAdvisorService.setNewSessionName(sessionId, title));
    }

    /**
     * POST /api/ai/sessions/{sessionId}/message
     * Sends a new user message to the AI and returns the AI's response.
     */
    @PostMapping("/sessions/{sessionId}/message")
    public ResponseEntity<AiMessageDTO> sendMessage(
            @PathVariable Integer sessionId,
            @RequestBody Map<String, String> payload) {

        String userText = payload.get("content");
        return ResponseEntity.ok(aiAdvisorService.sendMessage(sessionId, userText));
    }

    /**
     * POST /api/ai/sessions/new-chat
     * Sends a new user message from a new session to the AI and returns the AI's response.
     */
    @PostMapping("/sessions/new-chat")
    public ResponseEntity<AiNewChatResponse> startNewChat(
            @RequestBody AiMessageRequest request) {

        return ResponseEntity.ok(aiAdvisorService.startNewChat(request.getContent()));
    }

    /**
     * Delete /api/ai/sessions/{sessionId}
     * Sends a new user message from a new session to the AI and returns the AI's response.
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> startNewChat(
            @PathVariable Integer sessionId) {
        aiAdvisorService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
