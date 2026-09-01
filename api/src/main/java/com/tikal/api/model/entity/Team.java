package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

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

    /* --- Team Members relation ==> If a Team is deleted, all its team Members are deleted --- */
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TeamMember> teamMembers = new ArrayList<>();

    /* --- Team Members relation ==> If a Team is deleted, all its projects are deleted --- */
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TeamMember> teamProjects = new ArrayList<>();

    public String getDefaultImageUrl() {
        return "https://api.dicebear.com/10.x/triangles/svg?backgroundColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=" + this.getName();
    }
}
