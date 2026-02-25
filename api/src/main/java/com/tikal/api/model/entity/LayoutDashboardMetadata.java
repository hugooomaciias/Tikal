package com.tikal.api.model.entity;

import java.io.Serializable;
import lombok.Data;

@Data
public class LayoutDashboardMetadata implements Serializable {
    private String navegador;
    private String ip;
    private String ubicacion;
}
