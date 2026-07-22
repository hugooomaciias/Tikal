package com.tikal.api.model.dto.calendar;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChangeTimeRequest {
    @NotNull
    private Instant initDateTime;
    @NotNull
    private Instant endDateTime;
}
