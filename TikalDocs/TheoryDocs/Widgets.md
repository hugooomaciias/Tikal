<a id="top"></a>

# Catálogo de Widgets de Tikal

Este documento detalla la estructura y lógica de negocio de cada widget devuelto en el diccionario dinámico del endpoint `/dashboard/sync`.

---
## Índice

- [1. Widgets del Home](#1-widgets-del-home)
  - [1.1. Progreso Semanal (Weekly Progress)](#11-progreso-semanal-weekly-progress)
  - [1.2. Cronómetro / Time Tracker](#12-cronómetro--time-tracker)
  - [1.3. Metadatos del Calendario](#13-metadatos-del-calendario)
  - [1.4. Gestor de Tareas (Task Widget)](#14-gestor-de-tareas-task-widget)
- [2. Widgets de Estadísticas (Statistics)](#2-widgets-de-estadísticas-statistics)
  - [2.1. Objetivo de Tiempo (Time Goal Widget)](#21-objetivo-de-tiempo-time-goal-widget)
  - [2.2. Comparativas (Comparison Widget)](#22-comparativas-comparison-widget)
  - [2.3. Mapa de Calor de Concentración (Heatmap Widget)](#23-mapa-de-calor-de-concentración-heatmap-widget)
  - [2.4. Consejero de IA (IA Advice Widget)](#24-consejero-de-ia-ia-advice-widget)
  - [2.5. Gráfico Solar (Solar Chart Widget)](#25-gráfico-solar-solar-chart-widget)


---

## 1. Widgets del Home

### 1.1. Progreso Semanal (Weekly Progress)
* **Identificador (Key):** `weeklyProgressWidget`

**Lógica de Negocio:**
Muestra la dedicación de tiempo en una ventana "rodante" de los últimos 7 días, terminando siempre en el día actual (Hoy). 
* **Escalado de Gráfica:** El campo `maxMinutesRegistered` contiene el valor más alto de minutos registrados en un solo día dentro de esta ventana de 7 días. El frontend debe usar este valor para establecer el tope del eje Y en la gráfica.

**Payload (`WidgetData`):**
```json
{
  "startDate": "2026-04-04",
  "endDate": "2026-04-10",
  "maxMinutesRegistered": 145,
  "days": [
    { "date": "2026-04-04", "dayLabel": "S", "minutesDedicated": 0 },
    { "date": "2026-04-05", "dayLabel": "D", "minutesDedicated": 45 },
    { "date": "2026-04-06", "dayLabel": "L", "minutesDedicated": 145 },
    // ... hasta el día actual
  ]
}
```

### 1.2. Cronómetro / Time Tracker
* **Identificador (Key):** `timeTrackerWidget`

**Lógica de Negocio:**
Provee el estado inicial para el componente del cronómetro. 
* **Arquitectura:** El backend *no* lleva la cuenta en tiempo real. El frontend es responsable de hacer el "tictac" e incrementar los segundos localmente. Solo se hace POST al backend al detener el cronómetro para guardar el `time_log`.
* **Inicialización:** Devuelve la información de la *última tarea* en la que el usuario registró tiempo (o una tarea aleatoria si es nuevo). 
* **Acumulado:** `accumulatedSeconds` representa el tiempo histórico global que el usuario ha dedicado a esa tarea específica desde que la creó, no solo el tiempo de hoy.

**Payload (`WidgetData`):**
```json
{
  "taskId": 1,
  "projectOrPhaseName": "Fase 1 de ejemplo",
  "taskName": "Explorar el Dashboard Solar",
  "parentColor": "#E1BA63",
  "projectLogoIcon": "IconBook",
  "accumulatedSeconds": 3600
}
```

### 1.3. Metadatos del Calendario
* **Identificador (Key):** `calendarWidget`

**Lógica de Negocio:**
Provee *exclusivamente* las preferencias de visualización y configuración del calendario.
* **Separación de datos:** Este widget **no** contiene los eventos. El frontend debe extraer la lista de eventos desde la propiedad raíz `calendarEvents` del JSON principal y mapearlos sobre esta vista.
* **Preferencias:** Los campos como `startHour` y `showWeekends` provienen directamente de las configuraciones del usuario (`UserSettings`). El frontend debe usar `startHour` para hacer un auto-scroll matutino al renderizar la vista.

**Payload (`WidgetData`):**
```json
{
  "startDate": "2026-04-06",
  "endDate": "2026-04-12",
  "startHour": "08:00:00",
  "showWeekends": true
}
```

### 1.4. Gestor de Tareas (Task Widget)
* **Identificador (Key):** `taskWidget`

**Lógica de Negocio y Renderizado:**
Este es el widget más complejo del Home. Se encarga de mostrar las tareas del usuario agrupadas según su configuración y soporta carga diferida (lazy loading).

* **Progreso Global (`globalProgressPercentage`):** Representa el porcentaje de tareas completadas calculadas desde el día actual (hoy) hasta la fecha límite de la tarea más lejana que tenga el usuario. (Ej: `18.5`).
* **Paginación (`hasMoreCards`):** Para optimizar la carga inicial, el backend envía un máximo de **3 tarjetas**. Si esta flag es `true`, el frontend debe hacer una llamada (fetch) para solicitar el siguiente lote de tarjetas cuando el usuario navegue hacia la última tarjeta visible.

**Modos de Agrupación (`GroupingMode`):**
Dependiendo de la configuración del usuario, el contenido de `cards` varía:
1. **`BY_DEADLINE`:** Las tarjetas son siempre 3 bloques temporales estáticos: *"Para hoy y atrasadas"*, *"Próximos 3 días"* y *"Próxima semana"*. En este modo, `hasMoreCards` siempre será `false` en la carga inicial (ya que no hay más de 3 bloques).
2. **`BY_PROJECT`:** Cada tarjeta representa un Proyecto. Se ordenan priorizando los proyectos que contienen la tarea con la fecha de vencimiento más próxima. El campo `subtitle` vendrá siempre como `null`.

**Herencia de UI en `TaskItem`:**
* **Icono y Color:** Las tareas listadas heredan dinámicamente la identidad de su entorno. El `iconIdentifier` es el del Proyecto padre, y el `colorHex` es el de la Fase (Stage) en la que se encuentran.
* **Subtareas:** Este widget *solo lista tareas padre*. El campo `subtasksCount` es meramente informativo para mostrar un pequeño indicador numérico en la UI, pero el contenido de las subtareas no se envía en esta carga inicial.

**Payload (`WidgetData`):**
*(Ejemplo mostrando la agrupación por defecto: `BY_DEADLINE`)*
```json
{
  "selectedGroupingMode": "BY_DEADLINE",
  "globalProgressPercentage": 18.5,
  "hasMoreCards": false,
  "cards": [
    {
      "title": "Para hoy y atrasadas",
      "subtitle": "10 abr",
      "completedTasksCount": 2,
      "totalTasksCount": 5,
      "tasks": [
        {
          "taskId": 101,
          "name": "Explorar el Dashboard Solar",
          "iconIdentifier": "IconBook",
          "colorHex": "#E1BA63",
          "subtasksCount": 0,
          "isCompleted": false
        },
        {
          "taskId": 102,
          "name": "Configurar mi perfil y avatar",
          "iconIdentifier": "IconUser",
          "colorHex": "#224A57",
          "subtasksCount": 3,
          "isCompleted": true
        }
      ]
    },
    {
      "title": "Próximos 3 días",
      "subtitle": "11 abr - 13 abr",
      "completedTasksCount": 0,
      "totalTasksCount": 2,
      "tasks": []
    },
    {
      "title": "Próxima semana",
      "subtitle": "14 abr - 20 abr",
      "completedTasksCount": 0,
      "totalTasksCount": 0,
      "tasks": []
    }
  ]
}
```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

---

## 2. Widgets de Estadísticas (Statistics)

### 2.1. Objetivo de Tiempo (Time Goal Widget)
* **Identificador (Key):** `timeGoalWidget`

**Lógica de Negocio:**
Muestra el progreso del usuario hacia su meta de horas de la **semana en curso** (independientemente de sus preferencias de visualización).
* **Desbordamiento Controlado:** Si el usuario es extremadamente productivo y supera su meta (ej: dedica 50h con una meta de 40h), el `completionPercentage` tiene un tope (clamp) y devolverá siempre `100.0`. El frontend no debe preocuparse por barras circulares que se rompan o den más de una vuelta.

**Payload (`WidgetData`):**
```json
{
  "subtitle": "4 abr - 10 abr",
  "completionPercentage": 62.5,
  "goalDescription": "40 horas"
}
```

### 2.2. Comparativas (Comparison Widget)
* **Identificador (Key):** `comparisonWidget`

**Lógica de Negocio:**
Este widget devuelve una matriz de métricas que comparan el rendimiento actual (esta semana/mes) contra el periodo anterior.
* **Formatos Neta:** El campo `displayValue` ya viene procesado por el backend e incluye el signo matemático y la unidad. (Ej: `"+1h 30m"`, `"-45m"`, `"+5"`). El frontend solo debe pintar este string literalmente.
* **Indicadores de Color (`Trend`):** Dicta el color del texto y del icono (flecha).
  * `POSITIVE`: Rendimiento mejorado (Color Verde).
  * `NEGATIVE`: Rendimiento empeorado (Color Rojo).
  * `NEUTRAL`: Sin cambios significativos o datos a cero (Color Gris).

**Payload (`WidgetData`):**
```json
{
  "comparisons": [
    {
      "metricName": "Tiempo productivo",
      "displayValue": "+5h",
      "direction": "POSITIVE"
    },
    {
      "metricName": "Tareas completadas",
      "displayValue": "-2",
      "direction": "NEGATIVE"
    }
  ]
}
```

### 2.3. Mapa de Calor de Concentración (Heatmap Widget)
* **Identificador (Key):** `concentrationHeatmapWidget`

**Lógica de Negocio:**
El clásico "calendario de contribuciones" estilo GitHub. Muestra la intensidad del esfuerzo diario durante el **mes natural en curso** (del día 1 hasta el último día del mes).
* **Umbrales Fijos:** La intensidad no es relativa al récord del usuario, sino que se rige por umbrales estrictos.
  * `NONE`: 0 horas registradas (Fondo neutro).
  * `LOW`: Menos de 2 horas (Color muy claro).
  * `MEDIUM`: Entre 2 y 4 horas (Color claro).
  * `HIGH`: Entre 4 y 8 horas (Color oscuro).
  * `MAXIMUM`: Más de 8 horas (Color muy oscuro).

**Payload (`WidgetData`):**
```json
{
  "currentMonth": "Abril 2026",
  "dailyRecords": [
    { "date": "2026-04-01", "intensity": "MEDIUM", "tooltip": "3h 15m" },
    { "date": "2026-04-02", "intensity": "HIGH", "tooltip": "6h 40m" },
    { "date": "2026-04-03", "intensity": "NONE", "tooltip": "0h 0m" }
    // ... todo el mes
  ]
}
```

### 2.4. Consejero de IA (IA Advice Widget)
* **Identificador (Key):** `iaAdviceWidget`

**Estado:** EN CONSTRUCCIÓN (WIP)
**Lógica de Negocio:** Este widget analizará el historial del usuario para detectar patrones (ej: "Sueles ser menos productivo los jueves") y sugerirá ajustes en la planificación.
* **Manejo en Frontend:** Actualmente, el backend devolverá `null` o un payload vacío. El frontend debe ocultar este widget o mostrar un estado visual de "Próximamente" hasta que la integración con la IA esté finalizada.

---

## 2.5. Gráfico Solar (Solar Chart Widget)
* **Identificador (Key):** `solarChartWidget`

**🧠 Lógica de Negocio y Navegación:**
Es el gráfico más interactivo del Dashboard. Permite al usuario hacer "drill-down" (profundizar) en su distribución de tiempo: **Proyectos ➔ Fases ➔ Tareas**.

* **Estado Inicial:** En la llamada de sincronización global (`/sync`), este widget siempre llega en su estado raíz. El `currentLayer` es `"PROJECTS"` y el `parentId` es `null`.
* **Navegación (Drill-down):** Cuando el usuario hace clic en un "gajo" (slice) para ver qué hay dentro, el frontend **no** tiene los datos localmente. Debe llamar al endpoint específico `/widgets/solar-chart` pasando como Query Params el `currentLayer` deseado, el `timeRangeFilter` actual y el `sliceId` como nuevo `parentId`.
* **Cálculo de Porcentajes:** La suma del campo `percentage` de todos los `slices` devueltos **siempre suma 100.0**. Es un porcentaje relativo entre ellos, no absoluto respecto al tiempo total del usuario.
* **Filtro de Tiempo:** El `selectedFilter` se inicializa leyendo la preferencia `timeRange` de `UserSettings`. Si el usuario no tiene ninguna configurada, el backend lo inicializa en `"GLOBAL"`.

**🎨 Renderizado Dinámico de UI (`logo`, `colour` y `logoOrColour`):**
La identidad visual se divide en dos partes fundamentales para facilitar el renderizado:
1.  **El Centro del Gráfico (`logo` y `colour` en la raíz):** Determinan qué se pinta en el círculo interior del gráfico solar. 
    * En la capa `PROJECTS`, ambos serán `null`.
    * En la capa `STAGES`, `logo` contendrá el icono del proyecto padre.
    * En la capa `TASKS`, `logo` contendrá el icono del proyecto padre y `colour` el color de la fase padre.
2.  **Los Gajos (`logoOrColour` en los `slices`):** El frontend debe inferir el tipo de dato basándose en la capa actual (`currentLayer`).
    * Si la capa es `PROJECTS`: El string es un identificador de icono (ej. `"IconFolder"`).
    * Si la capa es `STAGES`: El string es un código de color hexadecimal (ej. `"#FF5733"`).
    * Si la capa es `TASKS`: Este valor será `null`, el front-end es el encargado de calcular el color.

**📦 Payload (`WidgetData`):**
*(Ejemplo mostrando un drill-down en la capa de Fases / STAGES)*
```json
{
  "selectedFilter": "WEEKLY",
  "customDateRange": null,
  "mostRecurringListName": "Fase más activa",
  "parentId": 1,
  "currentLayer": "STAGES",
  "logo": "IconBook",
  "colour": null,
  "slices": [
    {
      "sliceId": 14,
      "sliceName": "Diseño UI/UX",
      "percentage": 60.0,
      "minutesDedicated": 300,
      "logoOrColour": "#3B82F6" 
    },
    {
      "sliceId": 15,
      "sliceName": "Desarrollo Backend",
      "percentage": 40.0,
      "minutesDedicated": 200,
      "logoOrColour": "#10B981"
    }
  ]
}
```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

