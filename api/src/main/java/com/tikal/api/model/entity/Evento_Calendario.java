package com.tikal.api.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "evento_calendario")
public class Evento_Calendario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre; 

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime fechaFin;

    @Column(name = "activar_tracker_automaticamente", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean activarTrackerAutomaticamente = false;

    @Column(name = "color_personalizado_hex", nullable = false, length = 7)
    private String colorPersonalizadoHex;

    // Relación con Proyecto
    // Muchos eventos de calendario pueden pertenecer a un mismo Proyecto (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_proyecto")
    private Proyecto proyecto;

    // Relación con Tarea
    // Muchos eventos de calendario pueden pertenecer a una misma Tarea (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_tarea") 
    private Tarea tarea;

    // Relación con Fase
    // Muchos eventos de calendario pueden pertenecer a una misma Fase (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_fase")
    private Fase fase;

    // Relación con Usuario
    // Muchos eventos de calendario pueden pertenecer a un mismo Usuario  (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario") 
    private Usuario usuario;
}
