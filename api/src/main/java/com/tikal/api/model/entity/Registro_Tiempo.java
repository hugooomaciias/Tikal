package com.tikal.api.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "registro_tiempo")
public class Registro_Tiempo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(name = "fecha_inicio", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime fechaFin;

    @Column(name = "minutos_objetivo")
    private Integer minutosObjetivo; 

    @Column(name = "es_modo_templo", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean esModoTemplo = false; 

    @Column(name = "descripcion_actividad")
    private String descripcionActividad;  

    // Relación con Proyecto
    // Muchos registros de tiempo pueden registrarse a un mismo Proyecto (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_proyecto")
    private Proyecto proyecto;

    // Relación con Fase
    // Muchos registros de tiempo pueden registrarse a una misma Fase (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_fase")
    private Fase fase;

    // Relación con Tarea
    // Muchos registros de tiempo pueden registrarse a una misma Tarea (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_tarea") 
    private Tarea tarea;

    // Relación con Usuario
    // Muchos registros de tiempo pueden ser registrados por un mismo Usuario (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false) 
    private Usuario usuario;
}

// COMPLETAMENTE CORRECTA