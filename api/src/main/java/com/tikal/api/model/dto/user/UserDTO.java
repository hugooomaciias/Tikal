package com.tikal.api.model.dto.user;

import com.tikal.api.model.entity.enumerated.SubscriptionPlan;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    @Schema(description = "ID del usuario", example = "45")
    private Integer id;

    @Schema(description = "Nombre completo del usuario", example = "Fernando Pérez")
    private String name;

    @Schema(description = "Email del usuario", example = "fernando@example.com")
    private String email;

    @Schema(description = "URL del avatar del usuario", example = "https://.../avatar.png")
    private String avatarUrl;

    @Schema(description = "Título del rango (gamification)", example = "Novato")
    private String rangeTitle;

    @Schema(description = "Posición actual en el ranking", example = "3")
    private Integer currentRank;

    @Schema(description = "Plan de suscripción del usuario", example = "GRATUITO", allowableValues = {"GRATUITO","COMUNITARIO"})
    private SubscriptionPlan subscriptionPlan;

    @Schema(description = "Indica si el usuario completó el tutorial de Tikal", example = "true")
    private Boolean tikalTutorialCompleted;
}
