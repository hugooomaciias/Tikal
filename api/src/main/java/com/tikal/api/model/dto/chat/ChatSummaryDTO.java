package com.tikal.api.model.dto.chat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class ChatSummaryDTO {
    @Schema(description = "ID del chat (usuario o equipo)", example = "12")
    private Integer chatId;     // The User or team ID

    @Schema(description = "Nombre del chat", example = "Backend Team")
    private String chatName;    // "Laura Sánchez" or "Backend Team"

    @Schema(description = "Imagen del chat (avatar o logo)", example = "https://.../avatar.png")
    private String chatImage;    // Avatar URL or the team logo

    @Schema(description = "Indica si es un chat de equipo", example = "true")
    private Boolean isTeam;       // Just to have a reference for react to know what endpoint call

    @Schema(description = "Último mensaje en el chat", example = "Perfect. As well, you...")
    private String lastMessage;   // "Perfect. As well, you..."

    @Schema(description = "Fecha del último mensaje (ISO instant)", example = "2026-01-01T12:00:00Z")
    private Instant lastMessageDate; // Para ordenar la lista de más reciente a más antiguo

    @Schema(description = "Cantidad de mensajes no leídos", example = "3")
    private Long unreadCount;      // El globito verde con el número de mensajes sin leer
}


