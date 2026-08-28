package com.tikal.api.model.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UpdateRoleRequest {
    private String teamRole;
}
