# Documentación: Gamificación y Notificaciones (Modo Templo)

Este documento detalla el sistema de gamificación de Tikal, centrándose en cómo el Frontend debe procesar el array de eventos para disparar notificaciones de logros y cómo debe renderizar el inventario de tótems del usuario.

El sistema funciona bajo un modelo *Just-In-Time* (JIT). El backend evalúa los progresos en el momento exacto en el que se solicita la sincronización principal (`GET /sync`) y devuelve los eventos generados en ese instante.

---

## 1. Sistema Central de Notificaciones (`gamificationEvents`)

La estructura más importante para la interacción con el usuario es el array `gamificationEvents`, situado en la raíz del JSON de sincronización. Este array recoge todos los hitos que el usuario acaba de conseguir.

**Estructura del Payload:**

```json
"gamificationEvents": [
  {
    "type": "RANK_UP",
    "title": "¡Enhorabuena!",
    "message": "Has subido de rango: Guardián del Tiempo",
    "imageUrl": "/images/ranks/badge_2.svg"
  },
  {
    "type": "TOTEM_UNLOCKED",
    "title": "¡Tótem Desbloqueado!",
    "message": "Has conseguido el tótem: KIB",
    "imageUrl": "/images/totems/kib.svg"
  }
]
```

### Guía de Integración (Frontend):

1. **Lectura y Encolado:** Al recibir el JSON, evalúa la longitud del array `gamificationEvents`. Si está vacío, no hay acciones que realizar.
2. **Gestión de Múltiples Eventos:** Si el array contiene **más de un evento** (por ejemplo, el usuario subió de rango y además desbloqueó un tótem en la misma sesión), la UI debe gestionarlo para no solapar los modales:
* *Opción A (Carrusel):* Mostrar un modal con flechas de navegación (Siguiente/Anterior).
* *Opción B (Cola secuencial):* Mostrar el primer evento y, al hacer clic en "Cerrar" o "Aceptar", disparar el siguiente.


3. **Tipos de Evento (`type`):**
* `RANK_UP`: Subida de rango.
* `TOTEM_UNLOCKED`: Nuevo tótem conseguido.


---

## 2. Renderizado de Tótems (Barras de Progreso)

El nodo `templeMode.totems` contiene el inventario completo (bloqueados y desbloqueados) de los desafíos correspondientes al nivel del usuario.

**Estructura del DTO de Tótem:**

```json
{
  "id": 16,
  "name": "KIB",
  "goalDescription": "Alcanza efectividad global > 85% y mantén una racha de 7 días con efectividad > 75%",
  "isActive": false,
  "totemType": "EFFECTIVENESS_WITH_STREAK",
  "rank": 3,
  "totemImageUrl": "/images/totems/kib.svg",
  "targetProgress1": 85,
  "targetProgress2": 7,
  "currentProgress": {
    "progress1": 60,
    "progress2": 4,
    "description1": "Porcentaje de efectividad global",
    "description2": "Días consecutivos con eficiencia > 75%"
  }
}

```

### 💡 Lógica de UI para las Barras de Progreso:

El frontend solo necesita fijarse en el booleano `isActive` para decidir qué datos pintar, ignorando los cálculos complejos si el tótem ya es propiedad del usuario.

* 🔴 **Tótem Bloqueado (`isActive: false`):**
* **Barra 1:** Renderizar el progreso dinámico calculando `currentProgress.progress1` respecto a `targetProgress1` (Ej: mostrar `60 / 85`). Mostrar el texto de `description1`.
* **Barra 2 (Condicional):** Si `targetProgress2` existe (no es nulo), renderizar la segunda barra calculando `currentProgress.progress2` respecto a `targetProgress2`. Mostrar el texto de `description2`.


* 🟢 **Tótem Desbloqueado (`isActive: true`):**
* **Ignorar `currentProgress.progress1` y `progress2`.**
* El frontend asume directamente que el progreso está al 100%.
* Para la interfaz visual, basta con imprimir directamente la variable objetivo (Ej: pintar la barra completa y mostrar `targetProgress1 / targetProgress1` o simplemente `targetProgress1`).
* Aplicar un estilo visual distintivo (ej. sin opacidad, bordes dorados, icono iluminado) para destacar que el logro está completado.