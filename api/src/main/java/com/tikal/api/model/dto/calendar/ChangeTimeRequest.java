package com.tikal.api.model.dto.calendar;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChangeTimeRequest {
    @NotNull
    private LocalDateTime initDateTime;
    @NotNull
    private LocalDateTime endDateTime;
}
