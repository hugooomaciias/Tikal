package com.tikal.api.model.entity.metadata;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LayoutsDashboardMetadata implements Serializable {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Posiciones de widgets para la vista Home")
    private List<WidgetPosition> home = new ArrayList<>();

    @io.swagger.v3.oas.annotations.media.Schema(description = "Posiciones de widgets para la vista Statistics")
    private List<WidgetPosition> statistics = new ArrayList<>();

    @io.swagger.v3.oas.annotations.media.Schema(description = "Posiciones de widgets para la vista Team")
    private List<WidgetPosition> team = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WidgetPosition implements Serializable {
        @io.swagger.v3.oas.annotations.media.Schema(description = "Identificador del widget", example = "widget-1")
        private String i;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Posición X en la grilla", example = "0")
        private Integer x;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Posición Y en la grilla", example = "0")
        private Integer y;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Ancho en columnas del widget", example = "6")
        private Integer w;

        @io.swagger.v3.oas.annotations.media.Schema(description = "Alto en filas del widget", example = "4")
        private Integer h;
    }
}
