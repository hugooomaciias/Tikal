package com.tikal.api.model.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JoinTeamRequest {
    @Schema(description = "Código de invitación del equipo", example = "ABCD-1234")
    private String code;
}
