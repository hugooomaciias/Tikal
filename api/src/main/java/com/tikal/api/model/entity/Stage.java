package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * This class represents the Stage entity within the application's work breakdown
 * structure. It maps to the stage table in the database and acts as the
 * intermediate layer between Projects and Tasks, allowing users to group related
 * tasks together
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "stage")
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

    /* --- Definition of colour in hexadecimal format --- */
    @Column(name = "colour", length = 7)
    private String colour;

    /* --- Project relation ==> Many stages can belong to the same Project --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
