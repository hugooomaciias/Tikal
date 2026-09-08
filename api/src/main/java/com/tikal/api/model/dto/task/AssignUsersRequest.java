package com.tikal.api.model.dto.task;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class AssignUsersRequest {
    @Schema(description = "Lista de IDs de usuarios a asignar a la tarea", example = "[12,34]")
    private List<Integer> assignedUserIds;
}
