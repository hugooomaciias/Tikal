package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerado.*;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * This class represents the User Settings entity. It maps to the user_settings
 * table in the database and manages the personalized configuration for each
 * user, including interface themes, productivity goals, and dashboard layout
 * preferences.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "user_settings")
public class User_Settings {
    /* --- User relation ==> Many settings can belong to the same User --- */
    @Id
    @Column(name = "user_id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    /* --- Time range setting --- */
    @Enumerated(EnumType.STRING)
    @Column(name = "time_range", columnDefinition = "ENUM('SEMANAL', 'MENSUAL', 'TRIMESTRAL', 'ANUAL') DEFAULT 'SEMANAL'")
    private Time_Range_Setting timeRange = Time_Range_Setting.SEMANAL;

    /* --- Goal of hours to work --- */
    @Column(name = "hours_goal", columnDefinition = "INT DEFAULT 40")
    private Integer hoursGoal = 40;

    /* --- Theme setting --- */
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('CLARO', 'OSCURO', 'MAYA') DEFAULT 'MAYA'")
    private Theme_Setting theme = Theme_Setting.MAYA;

    /* --- Here we have the widgets position setting of the User --- */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_dashboard")
    private Layout_Dashboard_Metadata layoutDashboard;
}
