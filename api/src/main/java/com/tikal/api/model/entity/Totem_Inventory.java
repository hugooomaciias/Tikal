package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

/**
 * This class represents the Totem Inventory entity within the persistence layer.
 * It maps to the totem_inventory table in the database and acts as an association
 * entity that tracks the specific achievements earned by users over time
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "totem_inventory")
public class Totem_Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Date of acquisition of the Totem --- */
    @CreationTimestamp
    @Column(name = "acquisition_date", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime acquisitionDate;

    /* --- User relation ==> Many totems can be won by the same User --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /* --- Totem List relation ==> Many totems can be won from the same Totem List --- */
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_totem")
    private Totem_List totemList;
}
