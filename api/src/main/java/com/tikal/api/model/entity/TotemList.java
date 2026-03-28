package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerated.TypeOfGoal;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Name of the totem --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- Description of the goal to achieve the Totem --- */
    @Column(name = "goal_description", nullable = false, columnDefinition = "TEXT")
    private String goalDescription;

    /* --- Target progress to obtain this totem --- */
    @Column(name = "target_progress", nullable = false)
    private Integer targetProgress;

    /* --- Type of goal that the user has to achieve to get the totem --- */
    @Column(name = "type_of_goal", nullable = false)
    private TypeOfGoal typeOfGoal;

    /* --- Required Rank to achieve the Totem --- */
    @Column(name = "required_rank", nullable = false) 
    private Integer requiredRank;

    /* --- URL of the Totem image --- */
    @Column(name = "totem_image_url", length = 255)
    private String totemImageUrl;
}
