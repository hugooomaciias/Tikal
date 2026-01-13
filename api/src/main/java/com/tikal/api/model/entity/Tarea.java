package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "tarea")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false)
    private String nombre; 

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tiempo_estimado_min")
    private Integer tiempoEstimadoMin; 

    @Column(name = "ganancia_estimada", precision = 10, scale = 2)
    private BigDecimal gananciaEstimada; 

    @Column(name = "fecha_limite", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime fechaLimite;

    @Column(name = "es_comunitaria", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean esComunitaria = false; 

    // Relación con Fase
    // Muchas tareas pueden pertenecer a una misma Fase (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_fase", nullable = false)
    private Fase fase;

    // Relación con Usuario
    // Muchas tareas pueden pertenecer a un mismo Usuario (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_usuario_asignado") 
    private Usuario usuarioAsignado;

    // Relación con Tarea
    // Muchas tareas (subtareas) pueden pertenecer a una misma Tarea (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_tarea_padre") 
    private Tarea tareaPadre;
}

// COMPLETAMENTE CORRECTA