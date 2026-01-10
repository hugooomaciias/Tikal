package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@Entity
@Table(name = "equipo")
public class Equipo {
        
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "codigo_invitacion", unique = true, length = 50)
    private String codigoInvitacion;

    // Relación con Equipo
    // Pueden existir muchos subequipos (Many-to-One)
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_equipo_padre", nullable = true)
    @ToString.Exclude
    private Equipo equipoPadre;
}
