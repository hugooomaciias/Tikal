package com.tikal.api.model.dto;

import com.tikal.api.model.entity.enumerado.Subcription_Plan;

import lombok.Data;

@Data
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private String avatarUrl;
    private String rangeTitle;
    private Integer currentRank;
    private Subcription_Plan subscriptionPlan;
}
