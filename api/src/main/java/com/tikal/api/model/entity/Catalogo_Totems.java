package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "catalogo_totems")
public class Catalogo_Totems {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion_causa", nullable = false, columnDefinition = "TEXT")
    private String descripcionCausa;

    @Column(name = "rango_necesario", nullable = false) 
    private Integer rangoNecesario;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;
}

// COMPLETAMENTE CORRECTA