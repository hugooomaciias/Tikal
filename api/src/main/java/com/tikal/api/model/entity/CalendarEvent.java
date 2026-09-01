package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerated.EventType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the Calendar Event entity. It maps to the calendar_event
 * table in the database and manages the time-blocking functionality of the
 * application, allowing users to schedule specific work sessions or meetings on
 * their calendar
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "calendar_events")
public class CalendarEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Event name --- */
    @Column(nullable = false, length = 100)
    private String name; 

    /* --- Event description --- */
    @Column(columnDefinition = "TEXT")
    private String description;

    /* --- Init time of the event --- */
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "init_date_time", nullable = false, columnDefinition = "DATETIME")
    private Instant initDateTime;

    /* --- End time of the event --- */
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "end_date_time", nullable = false, columnDefinition = "DATETIME")
    private Instant endDateTime;

    /* --- If you want to activate the time tracker automatically, this is 'True' --- */
    @Column(name = "is_activate_tracker", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isActivateTracker = false;

    /* --- Colour of the event in case of don't have any task associated --- */
    @Column(name = "custom_colour", length = 7)
    private String customColour;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType = EventType.GENERAL;

    /* --- Security flag for the automatic tracker --- */
    @Column(name = "is_tracker_processed", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isTrackerProcessed = false;

    /* --- Security flag for the automatic tracker --- */
    @Column(name = "is_complete_day", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isCompleteDay = false;

    /* --- User relation ==> Many events can belong to the same User --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false) 
    private User organizer;

    /* --- Users invited to this event --- */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "event_attendees",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> attendees = new ArrayList<>();

    /* --- Project relation ==> Many events can belong to the same Project --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "project_id")
    private Project project;

    /* --- Stage relation ==> Many events can belong to the same Stage --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    /* --- Task relation ==> Many events can belong to the same Task --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "task_id") 
    private Task task;
}
