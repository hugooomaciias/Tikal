package com.tikal.api.model.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "mensaje")
public class Mensaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido; 

    @CreationTimestamp
    @Column(name = "fecha_envio", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaEnvio;

    @Column(name = "leido", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean leido = false; 

    // Relación con Usuario
    // Puede haber muchos mensajes enviados por un unico Usuario emisor (Many-to-One)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_emisor", nullable = false)
    private Usuario emisor;

    // Relación con Equipo
    // Puede haber mensajes a un mismo Equipo o ninguno (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_equipo_destino") 
    private Equipo equipoDestino;

    // Relación con Usuario
    // Puede haber muchos mensajes dirigidos a un mismo Usuario de destino (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_usuario_destino")
    private Usuario usuarioDestino;
}

// COMPLETAMENTE CORRECTA