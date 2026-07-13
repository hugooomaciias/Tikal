package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Project entity, acting as the top-level container in
 * the application's work hierarchy. It maps to the project table in the database
 * and serves as the root for organizing work, containing distinct phases and tasks
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Project name --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- Project description --- */
    @Column(columnDefinition = "TEXT")
    private String description;

    /* --- URL of the project logo --- */
    @Column(name = "logo_url")
    private String logoUrl;

    /* --- If the Project is group-based, this attribute has to be 'True' --- */
    @Column(name = "is_group_based", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isGroupBased = false;

    /* --- Deadline for completing the project --- */
    @Column(name = "deadline", columnDefinition = "DATETIME")
    private LocalDateTime deadline;

    /* --- Total time spent in minutes --- */
    @Column(name = "total_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer totalLoggedMinutes = 0;

    /* --- Time spent specifically in Temple Mode (in minutes) --- */
    @Column(name = "temple_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer templeLoggedMinutes = 0;

    /* --- User relation ==> Many projects can belong to the same User --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "user_owner_id")
    private User userOwner;

    /* --- Team relation ==> Many projects can belong to the same Team --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "team_id")
    private Team team;

    /* --- Stage relation ==> If a Project is deleted, all its stages are deleted. Lazy loaded. --- */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Stage> stages = new ArrayList<>();

    /* --- Calendar Events relation ==> If a Project is deleted, all its linked events are deleted --- */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CalendarEvent> calendarEvents = new ArrayList<>();

    /* --- Calendar Events relation ==> If a Project is deleted, all its linked events are deleted --- */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TimeLog> timeLogs = new ArrayList<>();
}
