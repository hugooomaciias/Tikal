package com.tikal.api.model.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "miembro_equipo")
public class Miembro_Equipo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(name = "es_administrador", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean esAdministrador = false; 

    @CreationTimestamp
    @Column(name = "fecha_ingreso", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaIngreso;

    // Relación con Usuario
    // Un mismo usuario puede ser miembro de diferentes equipos  
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    // Relación con Equipo
    // Puede haber muchos miembros en un mismo Equipo (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_equipo")
    private Equipo equipo;

    // Anadir restriccion unica de ambas relaciones
}

// COMPLETAMENTE CORRECTA