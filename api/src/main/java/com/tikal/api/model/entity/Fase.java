package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "fase")
public class Fase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre; 

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    // Relación con Proyecto
    // Muchas fases pueden pertenecer a un mismo Proyecto (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_proyecto", nullable = false)
    private Proyecto proyecto;
}

// COMPLETAMENTE CORRECTA