package com.tikal.api.model.dto.chat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChatMessageDTO {
    @Schema(description = "ID del mensaje", example = "123")
    private Integer id;

    @Schema(description = "Contenido del mensaje", example = "Hola, ¿estás disponible para una reunión?")
    private String content;

    @Schema(description = "Fecha de envío (ISO instant)", example = "2026-01-01T12:00:00Z")
    private Instant sendDate;

    @Schema(description = "ID del emisor del mensaje", example = "45")
    private Integer emitterId;

    @Schema(description = "Nombre del emisor", example = "María Pérez")
    private String emitterName;

    @Schema(description = "URL del avatar del emisor", example = "https://.../avatar.png")
    private String emitterAvatar;

    @Schema(description = "Indica si el mensaje es de equipo (true) o directo (false)", example = "false")
    private Boolean isTeamMessage;

    @Schema(description = "ID del equipo si es un mensaje de equipo", example = "7")
    private Integer teamId;

    @Schema(description = "Imagen del equipo asociada al mensaje", example = "https://.../team.png")
    private String teamImage;
}