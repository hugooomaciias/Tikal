package com.tikal.api.model.dto.sync.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GamificationEventDTO {
    private String type; // "RANK_UP", "TOTEM_UNLOCKED"
    private String title; // "¡Congratulations!"
    private String message; // "You earned the 'Imik' totem!"
    private String imageUrl; // URL of the totem icon or the rank icon
}
