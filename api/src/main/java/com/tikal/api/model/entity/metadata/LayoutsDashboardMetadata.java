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
    private List<WidgetPosition> home = new ArrayList<>();
    private List<WidgetPosition> statistics = new ArrayList<>();
    private List<WidgetPosition> team = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WidgetPosition implements Serializable {
        private String i;
        private Integer x;
        private Integer y;
        private Integer w;
        private Integer h;
    }
}
