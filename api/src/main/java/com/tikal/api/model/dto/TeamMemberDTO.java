package com.tikal.api.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TeamMemberDTO {
    private String userName;
    private String avatarUrl;
    private Boolean admin;

    public TeamMemberDTO(String userName, String avatarUrl, Boolean admin) {
        this.userName = userName;
        this.avatarUrl = avatarUrl;
        this.admin = admin;
    }
}
