# Documentación de Integración Frontend - Módulo de Productividad de Equipo (Fase 3)

Esta guía detalla los endpoints y estructuras de datos para la gestión colaborativa en Tikal. El cambio principal respecto a las fases anteriores es la transición de asignaciones individuales (1:1) a asignaciones múltiples (N:M) tanto en Tareas como en Eventos de Calendario.

---

## 1. Dashboards y Carga de Datos

### Gran Sync (Dashboard de Usuario)

* **Endpoint:** `GET /dashboard/sync`
* **Cambio Transparente:** Sigue siendo el punto de entrada principal. El backend ahora incluye automáticamente las tareas y eventos de los equipos a los que pertenece el usuario.
* **Nuevos Datos:** Dentro de las tareas y eventos, ya no recibirás un único usuario, sino arrays de objetos con los datos de los asignados (`assignedUsers` y `attendees`) listos para renderizar avatares apilados: `{ id, name, avatar }`.

### Dashboard de Proyecto de Equipo (Vista Colaborativa)

* **Endpoint:** `GET /dashboard/project/{projectId}`
* **Propósito:** Renderizar la vista de gestión específica de un proyecto de equipo.
* **Estructura de la Respuesta (`ProjectDashboardDTO`):**
* **Header (Cabecera):** Contiene métricas como `progress` (%) y `teamEffectiveness` (%). Atención especial a `leftDays`: **puede ser `null**` si el proyecto no tiene fecha límite fijada. El frontend debe prever este caso (ej. mostrar "Sin fecha").
* **Cuerpo Izquierdo (`stages`):** Array con las fases y sus tareas para pintar las sublistas.
* **Cuerpo Derecho (`members`):** Array de los miembros del equipo con su carga de trabajo específica en este proyecto (`pendingTasks` y `completedTasks`), ideal para identificar cuellos de botella.

---

## 2. Gestión de Proyectos de Equipo

### Listar Proyectos de un Equipo

* **Endpoint:** `GET /api/projects/team/{teamId}`
* **Uso Frontend:** Ideal para las tarjetas cuando el usuario entra en el espacio de trabajo de un equipo concreto.

### Crear un Proyecto de Equipo

* **Endpoint:** `POST /api/projects` *(Mismo endpoint que proyectos personales)*
* **Payload Frontend:** Añade las variables `isGroupBased` y `teamId` al JSON habitual.

```json
{
  "name": "Lanzamiento V2",
  "isGroupBased": true,
  "teamId": 5
}
```

* **Lógica Backend:** El servidor verifica que el usuario sea Administrador del equipo. Si lo es, crea el proyecto y lo vincula al equipo en lugar de al usuario individual.

---

## 3. Tareas Colaborativas

### Crear Tarea con Múltiples Asignados

* **Endpoint:** `POST /api/tasks`
* **Payload Frontend:** Incluye el array `assignedUserIds`.

```json
{
  "name": "Diseñar Base de Datos",
  "stageId": 12,
  "assignedUserIds": [1, 4, 7] 
}
```

### Reasignar Usuarios (Drag & Drop de Avatares)

* **Endpoint:** `PATCH /api/tasks/{taskId}/assign`
* **Payload Frontend:** Envía la lista definitiva de IDs. El backend sobrescribe la lista anterior.

```json
{
  "assignedUserIds": [1, 4] 
}
```

* **Permisos:** Solo los **Administradores** del equipo pueden asignar o reasignar usuarios.

### Completar/Mover Tareas

* **Endpoint:** `PATCH /api/tasks/{id}/toggle-status`
* **Permisos:** Un usuario estándar puede completar la tarea **solo si está dentro de la lista de asignados**. Los administradores pueden completar cualquiera.

---

## 4. Calendario y Reuniones Compartidas

### Crear y Editar Eventos

* **Endpoints:** `POST /api/events` y `PUT /api/events/{eventId}` *(Rutas del controlador de calendario)*
* **Payload Frontend:** Envía la lista de invitados en `attendeeIds`.

```json
{
  "name": "Daily Sync",
  "initDateTime": "2026-09-01T10:00:00Z",
  "endDateTime": "2026-09-01T10:30:00Z",
  "attendeeIds": [2, 3, 5]
}
```

* **Lógica Backend:** El backend detecta quién hace la petición y lo registra automáticamente como `organizer` (dueño del evento) y lo incluye en la lista final de asistentes.
* **Permisos de Edición:** Solo el `organizer` original tiene permiso para modificar o eliminar el evento.
