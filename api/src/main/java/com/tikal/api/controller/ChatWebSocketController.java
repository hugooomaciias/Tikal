package com.tikal.api.controller;

import com.tikal.api.config.CustomUserDetails;
import com.tikal.api.model.dto.chat.ChatMessageDTO;
import com.tikal.api.model.entity.Message;
import com.tikal.api.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.Instant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat WebSocket", description = "Canales WebSocket para mensajería en tiempo real")
@SecurityRequirement(name = "bearerAuth")
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // Lightweight DTOs for Data Entry via Socket
    public record DirectMessageRequest(Integer receiverId, String content) {}
    public record TeamMessageRequest(Integer teamId, String content) {}


    /**
     * MESSAGE /chat.direct
     * WebSocket channel for sending direct (1-on-1) messages.
     */
    @Operation(summary = "Chat directo (WebSocket)", description = "Canal WebSocket para enviar mensajes directos (1-a-1).")
    @MessageMapping("/chat.direct")
    public void handleDirectMessage(@Payload DirectMessageRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer senderId = userDetails.getUser().getId();

        // 1. Save in MySQL
        Message savedMessage = chatService.sendDirectMessage(senderId, request.receiverId(), request.content());

        // 2. Map the DTO to protect the data
        ChatMessageDTO dto = ChatMessageDTO.builder()
                .id(savedMessage.getId())
                .content(savedMessage.getContent())
                .sendDate(savedMessage.getSendDate())
                .emitterId(senderId)
                .emitterName(savedMessage.getEmitter().getName())
                .emitterAvatar(savedMessage.getEmitter().getAvatarUrl())
                .isTeamMessage(false)
                .teamId(null)
                .build();

        // 3. Send to the recipient in real time
        messagingTemplate.convertAndSendToUser(
                request.receiverId().toString(),
                "/queue/messages",
                dto
        );

        // 4. Send it to yourself
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                dto
        );
    }

    /**
     * MESSAGE /chat.team
     * WebSocket channel for sending messages to a team room (broadcast to team members).
     */
    @Operation(summary = "Chat de equipo (WebSocket)", description = "Canal WebSocket para enviar mensajes a una sala de equipo (broadcast a los miembros del equipo).")
    @MessageMapping("/chat.team")
    public void handleTeamMessage(@Payload TeamMessageRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer senderId = userDetails.getUser().getId();

        // 1. Saves in MySQL
        Message savedMessage = chatService.sendTeamMessage(senderId, request.teamId(), request.content());

        // 2. Map to DTO
        ChatMessageDTO dto = ChatMessageDTO.builder()
                .id(savedMessage.getId())
                .content(savedMessage.getContent())
                .sendDate(savedMessage.getSendDate())
                .emitterId(senderId)
                .emitterName(savedMessage.getEmitter().getName())
                .emitterAvatar(savedMessage.getEmitter().getAvatarUrl())
                .isTeamMessage(true)
                .teamId(request.teamId())
                .teamImage(savedMessage.getTargetTeam().getImageUrl())
                .build();

        // 3. Broadcast to the entire team room by sending the DTO
        messagingTemplate.convertAndSend("/topic/team/" + request.teamId(), dto);
    }
}
