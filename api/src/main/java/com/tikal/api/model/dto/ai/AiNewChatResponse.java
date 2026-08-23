package com.tikal.api.model.dto.ai;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiNewChatResponse {
    private AiSessionDTO session;
    private AiMessageDTO firstAiMessage;
}
