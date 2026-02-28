package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    /* --- Estimated time to complete the Task --- */
    @Column(name = "estimated_time")
    private Integer estimatedTime; 

    /* --- Estimated profit obtained upon completion of the Task --- */
    @Column(name = "estimated_profit", precision = 10, scale = 2)
    private BigDecimal estimatedProfit; 

    /* --- Deadline for completing the Task --- */
    @Column(name = "deadline", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime deadline;

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
}
