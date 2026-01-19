package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.tikal.api.model.entity.enumerado.Subcription_Plan;

/** 
 * This class represents the core User entity within the application's persistence
 * layer. It maps directly to the user table in the database and manages user
 * credentials, profile information, subscription plans, and Rank
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Username --- */
    @Column(nullable = false, length = 100)
    private String name;

    /* --- User email --- */
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /* --- User password --- */
    @Column(nullable = false)
    private String password;
 
    /* --- User subscription plan --- */
    @Enumerated(EnumType.STRING)                                                                            // Guarda "GRATUITO" en vez de 0
    @Column(name = "subscription_plan", columnDefinition = "ENUM('GRATUITO', 'COMUNITARIO') DEFAULT 'GRATUITO'")
    private Subcription_Plan subscriptionPlan = Subcription_Plan.GRATUITO;                                                        // Valor por defecto

    /* --- User avatar URL --- */
    @Column(name = "avatar_url")
    private String avatarUrl;

    /* --- Rank relation ==> Many users may have the same Rank --- */
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "current_rank", columnDefinition = "INT DEFAULT 1")
    private Rank_List currentRank;
    
    /* --- When a new User is created, they are assigned Rank 1 --- */
    @PrePersist
    public void prePersist() {
        if (this.currentRank == null) {
            this.currentRank = new Rank_List();
            this.currentRank.setId(1);
        }
    }
}
