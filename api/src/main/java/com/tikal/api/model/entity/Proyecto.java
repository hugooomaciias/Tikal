package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "proyecto")
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre; 

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "logo_url")
    private String logoUrl; 

    // Relación con Usuario
    // Muchos proyectos pueden pertenecer a un mismo Usuario (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_usuario_propietario")
    private Usuario usuarioPropietario;

    // Relación con Equipo
    // Muchos proyectos pueden pertenecer a un mismo Equipo (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_equipo") 
    private Equipo equipo;
}
