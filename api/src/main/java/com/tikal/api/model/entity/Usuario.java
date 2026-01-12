package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.tikal.api.model.entity.enumerado.Tipo_Plan;

/* 
* 
*/
@Data
@NoArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /* --- Nombre del usuario --- */
    @Column(nullable = false, length = 100)
    private String nombre;

    /* --- Email del usuario --- */
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;
 
    @Enumerated(EnumType.STRING)                                                                            // Guarda "GRATUITO" en vez de 0
    @Column(name = "tipo_plan", columnDefinition = "ENUM('GRATUITO', 'COMUNITARIO') DEFAULT 'GRATUITO'")
    private Tipo_Plan tipoPlan = Tipo_Plan.GRATUITO;                                                        // Valor por defecto

    @Column(name = "avatar_url")
    private String avatarUrl;

    /* --- Relación con Rango --> Muchos usuarios pueden tener el mismo Rango --- */
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "rango_actual", columnDefinition = "INT DEFAULT 1")
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

// COMPLETAMENTE CORRECTA