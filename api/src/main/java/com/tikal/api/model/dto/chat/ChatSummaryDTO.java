package com.tikal.api.model.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class ChatSummaryDTO {
    private Integer chatId;     // The User or team ID
    private String chatName;    // "Laura Sánchez" or "Backend Team"
    private String chatImage;    // Avatar URL or the team logo
    private Boolean isTeam;       // Just to have a reference for react to know what endpoint call
    private String lastMessage;   // "Perfect. As well, you..."
    private Instant lastMessageDate; // Para ordenar la lista de más reciente a más antiguo
    private Long unreadCount;      // El globito verde con el número de mensajes sin leer
}


