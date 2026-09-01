package com.tikal.api.model.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TeamMemberDTO {
    private Integer userId;
    private String name;
    private String avatar;
    private Boolean isAdmin;
    private String teamRole;
    private Boolean loggedUser;
}