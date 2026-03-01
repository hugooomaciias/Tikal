package com.tikal.api.model.entity.metadata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WidgetPreferencesMetadata implements Serializable {

    /* --- We use a dynamic map with a key (widget name) and a JSON generic object with specific preferences --- */
    private Map<String, Object> preferences = new HashMap<>();

    public void addPreference(String widgetId, Object config) {
        this.preferences.put(widgetId, config);
    }
}
