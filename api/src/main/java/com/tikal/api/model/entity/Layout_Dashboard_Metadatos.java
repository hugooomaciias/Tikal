package com.tikal.api.model.entity;

import java.io.Serializable;
import lombok.Data;

@Data
public class Layout_Dashboard_Metadatos implements Serializable {
    private String navegador;
    private String ip;
    private String ubicacion;
}
