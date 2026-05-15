package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * This class represents the Time Log entity. It maps to the time_log table in
 * the database and is responsible for recording the historical duration of work
 * sessions. It serves as the core data source for the application's statistics
 * and productivity dashboards
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "time_logs")
public class TimeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Date when you start the time tracker --- */
    @Column(name = "init_date_time", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime initDateTime;

    /* --- Date when you finish the time tracker --- */
    @Column(name = "end_date_time", columnDefinition = "DATETIME")
    private LocalDateTime endDateTime;

    /* --- Target time for focusing on a Task --- */
    @Column(name = "target_time")
    private Integer targetTime;

    /* --- If the Time_Log is in temple mode, this attribute has to be 'True' --- */
    @Column(name = "is_temple_mode", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isTempleMode = false;

    /* --- Description of the activity carried out during the focused time --- */
    @Column(name = "activity_description")
    private String activityDescription;

    /* --- Indicate whether this log has already been closed (Stop) or is still pending (Play/Pause) --- */
    @Column(name = "is_completed", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isCompleted = false;

    /* --- User relation ==> Many time logs can be recorded by the same User --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /* --- Project relation ==> Many time logs can be recorded to the same Project --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "project_id")
    private Project project;

    /* --- Stage relation ==> Many time logs can be recorded to the same Stage --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    /* --- Task relation ==> Many time logs can be recorded to the same Task --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "task_id")
    private Task task;

    /**
     * Calculates the total minutes between initDateTime and endDateTime
     * @return number of minutes, or 0 if endDateTime is null or before initDateTime
     */
    public long getMinutes() {
        if (initDateTime == null || endDateTime == null) {
            return 0L;
        }

        if (endDateTime.isBefore(initDateTime)) {
            return 0L; // Invalid case: end time is before start time
        }

        return java.time.Duration.between(initDateTime, endDateTime).toMinutes();
    }
}
