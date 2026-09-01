package com.tikal.api.model.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChatMessageDTO {
    private Integer id;
    private String content;
    private Instant sendDate;
    private Integer emitterId;
    private String emitterName;
    private String emitterAvatar;
    private Boolean isTeamMessage;
    private Integer teamId;
    private String teamImage;
}