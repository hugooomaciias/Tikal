package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

/**
 * This class represents the Team Member entity. It functions as an association
 * entity that resolves the Many-to-Many relationship between User and Team. It
 * maps to the team_member table and stores specific details about a user's
 * membership within a specific team, such as their role and joining date
 */
@Data
@NoArgsConstructor
@Entity
@Table(
    name = "team_members",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_team", columnNames = {"user_id", "team_id"})
    }
)
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- If the User is administrator of the team, this attribute has to be 'True' --- */
    @Column(name = "is_admin", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isAdmin = false; 

    /* --- Date of joining the Team --- */
    @CreationTimestamp
    @Column(name = "joining_date", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime joiningDate;

    /* --- Last date of reading messages from the Team --- */
    @CreationTimestamp
    @Column(name = "last_read_date", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime lastReadDate;

    /* --- User relation ==> The same User can be a member of different teams --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /* --- Team relation ==> There can be many members in the same Team --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
