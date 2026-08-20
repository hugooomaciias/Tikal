package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerated.ChatRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.Instant;

/**
 * This class represents the ChatMessage entity, which stores individual
 * messages within an AI conversation. It maps to the chat_messages table
 * in the database and records who sent the message (User, Assistant, or System).
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Message content --- */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /* --- Role of the emitter (USER, ASSISTANT, or SYSTEM) --- */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "ENUM('USER', 'ASSISTANT', 'SYSTEM')")
    private ChatRole role;

    /* --- Date when the message was sent or generated --- */
    @CreationTimestamp
    @JdbcTypeCode(org.hibernate.type.SqlTypes.TIMESTAMP_UTC)
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Instant createdAt;

    /* --- Chat Session relation ==> Many messages belong to the same Chat Session --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;
}
