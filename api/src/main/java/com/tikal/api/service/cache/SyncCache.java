package com.tikal.api.service.cache;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Component
@RequestScope
public class SyncCache {
    private final Map<String, Object> cache = new HashMap<>();

    @SuppressWarnings("unchecked")
    public <T> T get(String key, Supplier<T> supplier) {
        if (cache.containsKey(key)) {
            return (T) cache.get(key);
        } else {
            T value = supplier.get();
            cache.put(key, value);
            return value;
        }
    }

    public void clear() {
        cache.clear();
    }
}
