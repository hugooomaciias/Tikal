package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment en MySQL
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)                        // Guarda "GRATUITO" en vez de 0
    @Column(name = "tipo_plan")
    private TipoPlan tipoPlan = TipoPlan.GRATUITO;      // Valor por defecto

    @Column(name = "avatar_url")
    private String avatarUrl;

    // Relación con Rango
    // Muchos usuarios pueden tener el mismo Rango (Many-to-One)
    @ManyToOne(fetch = FetchType.EAGER)                 // EAGER carga el rango automáticamente al pedir el usuario
    @JoinColumn(name = "rango_actual", nullable = false)
    private Rango rangoActual;
    
    // Al crear un usuario nuevo, por defecto le asignamos un objeto Rango con ID 1
    // Esto requiere que el Rango 1 exista en BD al guardar el usuario
    @PrePersist
    public void prePersist() {
        if (this.rangoActual == null) {
            this.rangoActual = new Rango();
            this.rangoActual.setId(1);              // Asumimos que ID 1 es "Aprendiz"
        }
    }
}
