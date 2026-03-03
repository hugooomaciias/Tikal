package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * This class represents the Rank entity, which is the cornerstone of the
 * application's gamification system. It maps to the rank table in the database
 * and defines the static progression levels that users can achieve based on
 * their
 * productivity
 */
@Data
@Entity
@Table(name = "rank_lists")
public class RankList {
    @Id
    private Integer id;

    /* --- Name of the current temple --- */
    @Column(name = "temple_name", length = 50)
    private String templeName;

    /* --- Title awarded to the User --- */
    @Column(name = "awarded_title", length = 100)
    private String awardedTitle;

    /* --- Hours required to reach Rank --- */
    @Column(name = "required_hours")
    private Integer requiredHours;

    /* --- URL of the badge image's Rank --- */
    @Column(name = "badge_image_url")
    private String badgeImageUrl;

    /* --- URL of the temple image's Rank --- */
    @Column(name = "temple_image_url")
    private String templeImageUrl;

    /* --- URL of the clock image's Rank --- */
    @Column(name = "clock_image_url")
    private String clockImageUrl;

    /* --- URL of the clock image's Rank --- */
    @Column(length = 7)
    private String colour;
}
