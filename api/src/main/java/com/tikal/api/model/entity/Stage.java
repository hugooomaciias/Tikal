package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Stage entity within the application's work
 * breakdown
 * structure. It maps to the stage table in the database and acts as the
 * intermediate layer between Projects and Tasks, allowing users to group
 * related
 * tasks together
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "stages")
public class Stage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Stage name --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- Project description --- */
    @Column(columnDefinition = "TEXT")
    private String description;

    /* --- Definition of colour in front-end id format --- */
    @Column(name = "colour", length = 4)
    private String colour;

    /* --- Deadline for completing the stage --- */
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "deadline", columnDefinition = "DATETIME")
    private Instant deadline;

    /* --- Total time spent in minutes --- */
    @Column(name = "total_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer totalLoggedMinutes = 0;

    /* --- Time spent specifically in Temple Mode (in minutes) --- */
    @Column(name = "temple_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer templeLoggedMinutes = 0;

    /* --- Task relation ==> If a Stage is deleted, all its tasks are deleted. Lazy loaded. --- */
    @OneToMany(mappedBy = "stage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Task> tasks = new ArrayList<>();

    /* --- Project relation ==> Many stages can belong to the same Project --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /* --- Calendar Events relation ==> If a Stage is deleted, all its linked events are deleted --- */
    @OneToMany(mappedBy = "stage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CalendarEvent> calendarEvents = new ArrayList<>();
}
