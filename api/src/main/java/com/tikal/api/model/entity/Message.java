package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

/**
 * This class represents the Message entity, which facilitates the communication
 * system within the application. It maps to the message table in the database
 * and handles both direct messaging between users and group chat functionality
 * within teams
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Message content --- */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; 

    /* --- Date when you send the message --- */
    @CreationTimestamp
    @Column(name = "send_date", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Instant sendDate;

    /* --- If the Message is read, this attribute has to be 'True' --- */
    @Column(name = "is_read", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isRead = false; 

    /* --- User relation ==> Many messages can be send by the same emitter User --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "emitter_id", nullable = false)
    private User emitter;

    /* --- Team relation ==> Many messages can be send to the same Team or none --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "target_team_id") 
    private Team targetTeam;

    /* --- User relation ==> Many messages can be send to the same receiver User --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "receiver_id")
    private User receiver;
}
