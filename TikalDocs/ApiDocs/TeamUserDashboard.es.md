# Documentación de Integración Frontend - Dashboard de Miembro de Equipo (Fase 3 Final)

Esta guía detalla la estructura y el significado de los datos que devuelve el nuevo endpoint del **Dashboard del Miembro del Equipo**. A diferencia del "Gran Sync" (que trae toda la información del usuario) y del "Dashboard de Proyecto" (orientado a administradores), esta vista está hiper-focalizada en responder a la pregunta: *"¿Cuál es mi situación y mis tareas dentro de este equipo específico?"*.

---

## Endpoint Principal

* **Ruta:** `GET /dashboard/team/{teamId}/member`
* **Descripción:** Construye al vuelo todos los widgets y métricas personales del usuario autenticado en el contexto de un equipo concreto.
* **Seguridad:** El backend verifica automáticamente que el usuario pertenezca al `teamId` solicitado. Si no, devuelve un error 403 (Forbidden).

---

## Estructura de la Respuesta (`TeamMemberDashboardDTO`)

El JSON devuelto está dividido exactamente en los 4 bloques visuales. Aquí tienes la explicación semántica de cada uno:

### 1. Cabecera (`header`)

Contiene el estado del usuario en el equipo.

```json
"header": {
  "rol": "Developer", 
  "effectiveness": 85.5, 
  "progress": 42.8, 
  "rankingPosition": 2 
}
```

* **`rol`**: El rol específico (String) que tiene el usuario dentro de este equipo.
* **`effectiveness`**: Porcentaje global del equipo (Double). Compara el tiempo estimado frente al tiempo real invertido en las tareas completadas.
* **`progress`**: El progreso *individual* del usuario (Double). Representa el porcentaje de tareas principales completadas respecto al total de tareas que se le han asignado en los proyectos de este equipo.
* **`rankingPosition`**: La posición actual del usuario en la tabla de clasificación (1-based index).

### 2. Ranking del Equipo (`ranking`)

Ocupa el 1/4 izquierdo. Muestra el Top 10 de miembros del equipo.

```json
"ranking": {
  "members": [
    {
      "id": 4,
      "name": "Laura",
      "rol": "Admin",
      "avatar": "url_to_avatar.png",
      "score": 1240
    }
  ]
}
```

* **Significado de `score`:** No son tareas completadas, son **Minutos Totales** dedicados a proyectos de este equipo. Esto fomenta el "Deep Work" por encima de hacer micro-tareas rápidas. El array ya viene ordenado de mayor a menor puntuación.

### 3. Actividad Reciente (`recentActivities`)

Ocupa los 2/4 centrales superiores. Reemplaza al clásico panel de notificaciones. Funciona dinamicamente (no requiere marcar como leído/no leído, los ítems desaparecen solos por tiempo o cuando cambia su estado).

```json
"recentActivities": {
  "activities": [
    {
      "title": "Entrega Próxima",
      "description": "Diseñar Base de Datos debe entregarse pronto.",
      "date": "2026-09-02T18:00:00Z",
      "type": "DEADLINE"
    }
  ]
}
```

* **Límites:** Devuelve un máximo de 15 actividades, ordenadas de la más reciente/urgente a la más antigua.
* **`type` (Enum `ActivityType`):** Puede ser `CHAT`, `TASK` (asignadas en las últimas 48h), `CALENDAR` (eventos próximos en 3 días), `ROLE`, o `DEADLINE` (caducan en menos de 48h o ya han caducado). Usa este campo para renderizar iconos o colores distintos en React.

### 4. Tareas del Usuario (`taskWidgetData`)

Ocupa el 1/4 derecho. Muestra **únicamente** las tareas asignadas al usuario actual dentro de los proyectos de este equipo.

```json
"taskWidgetData": {
  "selectedGroupingMode": "BY_PROJECT",
  "subtitle": "45.0% completado",
  "hasMoreCards": false,
  "cards": [
    {
      "title": "Proyecto: Lanzamiento V2",
      "subtitle": "3 pendientes",
      "completedTasksCount": 5,
      "totalTasksCount": 8,
      "tasks": [
        {
          "taskId": 14,
          "name": "Diseñar Base de Datos",
          "logo": "url_to_project_logo.png",
          "color": "g-7",
          "subtasksCount": 2,
          "isCompleted": false
        }
      ]
    }
  ]
}
```

* **Agrupación (`BY_PROJECT`):** A diferencia de la Home (donde se agrupan por fechas límite), aquí cada "tarjeta" (Card) representa un Proyecto distinto del equipo.
* **Filtro de items:** Dentro del array `tasks` de cada tarjeta, solo viajan las tareas **pendientes**. Las completadas solo suman para los contadores (`completedTasksCount`).

### 5. Calendario (`calendarWidget`)

Ocupa los 2/4 centrales inferiores.

* **Nota Frontend:** Este nodo devuelve únicamente la **configuración visual** (día de inicio de la semana, hora de inicio). Los eventos en sí mismos no viajan aquí para evitar duplicar megas de JSON. El frontend debe filtrar la lista global de eventos (obtenida en el Gran Sync de la Home) mostrando en este calendario solo aquellos eventos cuyo `linkedEntityId` apunte a un proyecto/fase de este `teamId` y donde el usuario esté en la lista de `attendees`.

---

## 🛠️ Consejos de Integración para el Frontend

1. **Gestión de Fechas (`Instant`):** Todos los campos de fechas (`date` en activities, etc.) llegan en formato Zulu/UTC ISO 8601 (ej. `"2026-09-02T10:00:00Z"`). Utiliza el paquete date-fns o la API de JS para formatearlos a la hora local del dispositivo del usuario.
2. **Carga Perezosa (Opcional):** Si la consulta tarda un poco más por los cálculos matemáticos, considera poner un componente `<Skeleton/>` en el frontend mientras se resuelve la petición `GET /dashboard/team/{teamId}/member`.