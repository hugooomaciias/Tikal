package com.tikal.api.model.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@AllArgsConstructor
@Schema(name = "UpdateRoleRequest", description = "Payload para actualizar el rol de un miembro del equipo")
public class UpdateRoleRequest {
    @Schema(description = "Nuevo rol dentro del equipo", example = "RRHH")
    private String teamRole;
}
