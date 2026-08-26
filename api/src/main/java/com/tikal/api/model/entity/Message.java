package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;

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
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "send_date", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Instant sendDate;

    /* --- If the Message is read, this attribute has to be 'True' --- */
    @Column(name = "is_read", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isRead = false; 

    /* --- User relation ==> Many messages can be sent by the same emitter User --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "emitter_id", nullable = false)
    private User emitter;

    /* --- Team relation ==> Many messages can be sent to the same Team or none --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "target_team_id") 
    private Team targetTeam;

    /* --- User relation ==> Many messages can be sent to the same receiver User --- */
    @ManyToOne(optional = true)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @PrePersist
    @PreUpdate
    private void validateTarget() {
        boolean hasReceiver = receiver != null;
        boolean hasTeam = targetTeam != null;

        if (hasReceiver == hasTeam) {
            throw new IllegalStateException("Un mensaje debe tener exactamente un destinatario (Usuario O Equipo), pero no ambos ni ninguno.");
        }
    }
}
