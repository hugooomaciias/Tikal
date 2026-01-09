package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data; // Lombok genera getters/setters auto

@Data
@Entity
@Table(name = "rangos")
public class Rango {

    @Id
    private Integer id;

    @Column(name = "nombre_templo", nullable = false)
    private String nombreTemplo;

    @Column(name = "titulo_otorgado", nullable = false)
    private String tituloOtorgado;

    @Column(name = "horas_necesarias", nullable = false)
    private Integer horasNecesarias;

    @Column(name = "imagen_insignia_url")
    private String imagenInsigniaUrl;
}
