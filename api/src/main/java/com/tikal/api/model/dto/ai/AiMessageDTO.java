package com.tikal.api.model.dto.ai;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AiMessageDTO {
    private Integer id;
    private String content;
    private String role;
    private Instant createdAt;
}
