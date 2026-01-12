package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.Data;                         // Lombok genera getters/setters auto

@Data
@Entity
@Table(name = "rango")
public class Rango {

    @Id
    private Integer id;

    @Column(name = "nombre_templo", length = 50)
    private String nombreTemplo;

    @Column(name = "titulo_otorgado", length = 100)
    private String tituloOtorgado;

    @Column(name = "horas_necesarias")
    private Integer horasNecesarias;

    @Column(name = "imagen_insignia_url")
    private String imagenInsigniaUrl;
}

// COMPLETAMENTE CORRECTA