package com.tikal.api.model.entity;

import com.tikal.api.model.entity.enumerado.*;
import com.tikal.api.model.entity.enumerado.Configuracion_Rango_Tiempo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@Entity
@Table(name = "configuracion_usuario")
public class Configuracion_Usuario {
    // Relación con Usuario
    // Muchas configuraciones de usuario pueden pertenecer a un mismo Usuario (Many-to-One)
    @Id
    @Column(name = "id_usuario")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)                                                                     // Guarda "SEMANAL" en vez de 0
    @Column(name = "rango_tiempo_defecto", columnDefinition = "ENUM('SEMANAL', 'MENSUAL', 'TRIMESTRAL', 'ANUAL') DEFAULT 'SEMANAL'")
    private Configuracion_Rango_Tiempo rangoTiempoDefecto = Configuracion_Rango_Tiempo.SEMANAL;      // Valor por defecto

    @Column(name = "objetivo_horas_semanal", columnDefinition = "INT DEFAULT 40")
    private Integer objetivoHorasSemanal = 40;

    @Enumerated(EnumType.STRING)                                            // Guarda "MAYA" en vez de 0
    @Column(name = "tema_interfaz", columnDefinition = "ENUM('CLARO', 'OSCURO', 'MAYA') DEFAULT 'MAYA'")
    private Configuracion_Tema temaInterfaz = Configuracion_Tema.MAYA;      // Valor por defecto

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_dashboard")
    private Layout_Dashboard_Metadatos layoutDashboard;

    // Que sentido tiene la relacion de que muchas configuraciones
    // de usuario pertenezcan a un mismo usuario?!
}

// COMPLETAMENTE CORRECTA