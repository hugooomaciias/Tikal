package com.tikal.api.model.dto.user;

import com.tikal.api.model.entity.enumerated.SubscriptionPlan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private String avatarUrl;
    private String rangeTitle;
    private Integer currentRank;
    private SubscriptionPlan subscriptionPlan;
    private Boolean tikalTutorialCompleted;
}
