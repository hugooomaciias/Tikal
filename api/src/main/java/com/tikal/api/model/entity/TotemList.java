package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * This class represents the Totem List entity within the persistence layer. It
 * maps to the totem_list table in the database and serves as the master
 * definition for all collectable achievements available in the application's
 * gamification system
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "totem_lists")
public class TotemList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    /* --- Name of the totem --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- Description of the goal to achieve the Totem --- */
    @Column(name = "goal_description", nullable = false, columnDefinition = "TEXT")
    private String goalDescription;

    /* --- Required Rank to achieve the Totem --- */
    @Column(name = "required_rank", nullable = false) 
    private Integer requiredRank;

    /* --- URL of the Totem image --- */
    @Column(name = "totem_image_url", length = 255)
    private String totemImageUrl;
}
