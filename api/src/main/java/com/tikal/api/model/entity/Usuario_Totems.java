package com.tikal.api.model.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "usuario_totems")
public class Usuario_Totems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL 
    private Integer id;

    @CreationTimestamp
    @Column(name = "fecha_obtencion", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaObtencion;

    // Relación con Usuario
    // Muchos totems pueden ser ganados por el mismo Usuario (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    // Relación con Catalogo_Totems
    // Muchos totems pueden ser ganados desde un mismo Catalogo_Totems (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_totem")
    private Catalogo_Totems catalogoTotem;
}

// COMPLETAMENTE CORRECTA