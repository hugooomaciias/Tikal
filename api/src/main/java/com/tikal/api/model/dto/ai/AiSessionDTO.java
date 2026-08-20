package com.tikal.api.model.dto.ai;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AiSessionDTO {
    private Integer id;
    private String title;
    private Instant updatedAt;
}
