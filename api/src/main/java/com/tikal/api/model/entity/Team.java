package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * This class represents the Team entity within the application. It maps to the
 * team table in the database and manages the groups of users that collaborate on
 * projects. It supports a hierarchical structure, allowing for the creation of
 * departments or sub-teams within a larger organization
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "teams")
public class Team {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Team name --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- Team image --- */
    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    /* --- Invitation code for colleagues to join your team --- */
    @Column(name = "invitation_code", unique = true, length = 50)
    private String invitationCode;

    /* --- Team relation ==> Many teams (subteams) can belong to the same Team --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "parent_team_id")
    @ToString.Exclude
    private Team parentTeam;
}
