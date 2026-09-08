package com.tikal.api.model.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeamDTO {
    @Schema(description = "ID del equipo", example = "7")
    private Integer id;

    @Schema(description = "Nombre del equipo", example = "Backend Team")
    private String name;

    @Schema(description = "Código de invitación del equipo", example = "ABCD-1234")
    private String code;

    @Schema(description = "Ruta o URL de la imagen del equipo", example = "https://.../team-7.png")
    private String imagePath;

    @Schema(description = "Si el usuario actual es administrador del equipo", example = "true")
    private Boolean isAdmin;

    @Schema(description = "Rol del usuario dentro del equipo", example = "Desarrollador")
    private String teamRole;

    @Schema(description = "Cantidad de miembros en el equipo", example = "12")
    private Long members;
}
