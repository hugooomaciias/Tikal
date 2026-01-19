package com.tikal.api.model.dto;

import lombok.Data;

@Data
public class TeamDTO {
    private String name;
    private String invitationCode;

    public TeamDTO(String name, String invitationCode) {
        this.name = name;
        this.invitationCode = invitationCode;
    }
}
