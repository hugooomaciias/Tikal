package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Task entity, the fundamental unit of work within the
 *  application. It maps to the task table in the database and holds the specific
 * actionable items that users or teams need to complete. It supports nesting
 * estimation, and assignment logic
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Task name --- */
    @Column(nullable = false)
    private String name; 

    /* --- Project description --- */
    @Column(columnDefinition = "TEXT")
    private String description;

    /* --- Estimated time to complete the Task in minutes --- */
    @Column(name = "estimated_time")
    private Integer estimatedTime;

    /* --- Preferred units in which the estimated time for this task will be displayed --- */
    @Column(name = "time_unit")
    private Character timeUnit = 'm';

    /* --- Task completion status (true = completed, false = pending) --- */
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    /* --- Timestamp when the task was marked as completed --- */
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "completion_date", columnDefinition = "DATETIME")
    private Instant completionDate;

    /* --- Estimated profit obtained upon completion of the Task --- */
    @Column(name = "estimated_profit", precision = 10, scale = 2)
    private BigDecimal estimatedProfit;

    /* --- Deadline for completing the Task --- */
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "deadline", columnDefinition = "DATETIME")
    private Instant deadline;

    /* --- Total time spent in minutes --- */
    @Column(name = "total_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer totalLoggedMinutes = 0;

    /* --- Time spent specifically in Temple Mode (in minutes) --- */
    @Column(name = "temple_logged_minutes", columnDefinition = "INT DEFAULT 0")
    private Integer templeLoggedMinutes = 0;

    /* --- Stage relation ==> Many tasks can belong to the same Stage --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    /* --- User relation ==> Many tasks can belong to the same User --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "assigned_user_id") 
    private User assignedUser;

    /* --- Task relation ==> Many tasks (subtasks) can belong to the same Task --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "parent_task_id") 
    private Task parentTask;

    /* --- Two-way relationship to save parent and children in one go --- */
    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Task> subtasks = new ArrayList<>();

    /* --- Calendar Events relation ==> If a Task is deleted, all its linked events are deleted --- */
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CalendarEvent> calendarEvents = new ArrayList<>();
}
