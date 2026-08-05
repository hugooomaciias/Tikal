# ⏱️ Documentación de Endpoints de Time Log

Este documento describe todos los endpoints correspondientes a la gestión de registros de tiempo (Time Logs) y el **Time Tracker Dinámico** para la API. Aquí encontrarás los formatos de solicitud requeridos y las respuestas esperadas para las operaciones CRUD estándar y las operaciones de control de tiempo en vivo (Start, Pause, Stop).

*Nota: Todos los endpoints de este controlador requieren autenticación, ya que las operaciones están estrictamente vinculadas al usuario activo de la sesión.*

---

## 📋 Índice

* [1. Obtener Registros por Día](#1-obtener-registros-por-día-get-apitime_loglist_by_day)
* [2. Obtener Timer Activo (Widget)](#2-obtener-timer-activo-widget-get-apitime_logactive)
* [3. Iniciar / Reanudar Timer (Start)](#3-iniciar--reanudar-timer-start-post-apitime_logstart)
* [4. Pausar Timer (Pause)](#4-pausar-timer-pause-patch-apitime_logidpause)
* [5. Detener y Sellar Timer (Stop)](#5-detener-y-sellar-timer-stop-patch-apitime_logstop)
* [6. Crear Registro de Tiempo (Manual)](#6-crear-registro-de-tiempo-manual-post-apitime_log)
* [7. Actualizar Registro de Tiempo](#7-actualizar-registro-de-tiempo-put-apitime_logid)
* [8. Eliminar Registro de Tiempo](#8-eliminar-registro-de-tiempo-delete-apitime_logid)

---

### 1. Obtener Registros por Día (`GET /api/time_log/list_by_day`)

**Propósito**: Recuperar todos los registros de tiempo asociados al usuario autenticado para un día específico. Filtra desde el inicio del día (00:00:00) hasta el final del mismo (23:59:59).

**Request (Query Params)**:

* `day` (LocalDate, formato `YYYY-MM-DD`): La fecha de la que se quieren obtener los registros. *(Obligatorio)*

```http
GET /api/time_log/list_by_day?day=2026-05-15 HTTP/1.1
```

**Response (200 OK)**:

```json
[
  {
    "id": 15,
    "initTime": "2026-05-15T09:00:00",
    "endTime": "2026-05-15T10:30:00",
    "minutes": 90,
    "logo": "IconCode",
    "color": "blue",
    "taskName": "Desarrollo de API REST"
  }
]

```

---

### 2. Obtener Timer Activo (Widget) (`GET /api/time_log/active`)

**Propósito**: Endpoint optimizado para el *Widget del Time Tracker* en el Frontend. Calcula si el usuario tiene un *batch* (lote) de tiempo corriendo actualmente o en pausa, devolviendo el tiempo acumulado y la información visual, incluyendo las variables del Modo Templo.

```http
GET /api/time_log/active HTTP/1.1

```

**Response (200 OK)**:
Si hay un timer activo o en pausa:

```json
{
  "id": 42,
  "colour": "green",
  "logo": "IconBook",
  "entityName": "Hacer práctica 1",
  "initDateTime": "2026-05-15T10:15:00",
  "accumulatedSeconds": 1450,
  "isTempleMode": true,
  "targetTime": 60
}

```

*(Nota: Si `initDateTime` es `null`, significa que el timer está pausado de forma estándar y el Frontend solo debe mostrar los `accumulatedSeconds` estáticos. El Modo Templo nunca devuelve un estado pausado).*

**Response Alternativa (200 OK)**:
Si el usuario no tiene ninguna actividad en curso, devolverá un cuerpo vacío (`null`).

---

### 3. Iniciar / Reanudar Timer (Start) (`POST /api/time_log/start`)

**Propósito**: Arranca un nuevo contador de tiempo.

* **Seguridad anti-trampas:** Si se intenta iniciar una nueva Tarea/Fase/Proyecto mientras otro distinto estaba corriendo, el sistema cerrará automáticamente el anterior antes de iniciar el nuevo.
* **Modo Templo:** Si `isTempleMode` es `true`, es obligatorio enviar un `targetTime` (en minutos). Esto inicia una sesión ininterrumpible.

**Jerarquía Bottom-Up**: Solo es estrictamente necesario enviar el ID del nivel más profundo que se desea medir (el Backend deducirá automáticamente su Fase y Proyecto).

**Request (Body)**:

```json
{
  "initDateTime": "2026-05-15T10:15:00",
  "targetTime": 120,
  "isTempleMode": true,
  "taskId": 45
}

```

**Response (201 CREATED)**:
Devuelve el `TimeLogDTO` del nuevo registro de tiempo creado.

---

### 4. Pausar Timer (Pause) (`PATCH /api/time_log/{id}/pause`)

**Propósito**: Pausa un registro de tiempo estándar que estaba corriendo, asignándole una fecha de fin, pero dejándolo abierto para el *Batch* (`isCompleted = false`).
*(Aviso: Esta acción no está permitida / no aplica si el timer se inició en Modo Templo).*

**Request (Path Variables)**:

* `id`: ID del TimeLog específico que está corriendo.

**Request (Body)**:

```json
{
  "endDateTime": "2026-05-15T10:45:00",
  "activityDescription": "Pausa para café"
}

```

**Response (200 OK)**:
Devuelve el `TimeLogDTO` actualizado con la fecha de fin.

---

### 5. Detener y Sellar Timer (Stop) (`PATCH /api/time_log/stop`)

**Propósito**: Detiene un timer activo (si se envía ID) y sella todo el registro, marcándolo como completado (`isCompleted = true`) y unificándolo con una descripción.

* **Penalización Modo Templo:** Si el registro estaba en Modo Templo y la duración final es inferior al `targetTime` establecido (con un margen de gracia de 10 segundos), el backend actuará como juez, degradando el registro a tiempo estándar (`isTempleMode = false` y `targetTime = 0`).

**Request (Body)**:

```json
{
  "id": 42,
  "endDateTime": "2026-05-15T11:30:00",
  "activityDescription": "Sesión de estudio completada"
}

```

**Response (200 OK)**:
Devuelve un array con todos los `TimeLogDTO` que formaban parte del *Batch* (o el registro único del Templo) y que acaban de ser completados, reflejando si mantuvieron o perdieron el estatus de Templo.

---

### 6. Crear Registro de Tiempo (Manual) (`POST /api/time_log`)

**Propósito**: A diferencia del `start`, este endpoint se usa para insertar manualmente registros de tiempo en el pasado (que ya están finalizados).

**Request (Body)**:

```json
{
  "initDateTime": "2026-05-14T16:00:00",
  "endDateTime": "2026-05-14T18:00:00",
  "targetTime": 120,
  "isTempleMode": false,
  "activityDescription": "Trabajo manual off-line",
  "stageId": 12
}

```

**Response (201 CREATED)**:
Devuelve el `TimeLogDTO` insertado.

---

### 7. Actualizar Registro de Tiempo (`PUT /api/time_log/{id}`)

**Propósito**: Modificar un registro de tiempo existente. Valida permisos del usuario.
*Importante*: Durante la actualización es **obligatorio enviar al menos un `projectId**`, ya que el sistema exige que el registro no quede huérfano.

**Request (Body)**:

```json
{
  "initDateTime": "2026-05-14T16:30:00",
  "endDateTime": "2026-05-14T18:00:00",
  "isCompleted": true,
  "activityDescription": "Corrección de tiempo",
  "projectId": 3,
  "stageId": null,
  "taskId": null
}

```

*(Nota: La lógica de jerarquía calculará automáticamente los IDs ascendentes si se omiten).*

**Response (200 OK)**:
Devuelve el `TimeLogDTO` actualizado.

---

### 8. Eliminar Registro de Tiempo (`DELETE /api/time_log/{id}`)

**Propósito**: Eliminar permanentemente un registro de tiempo específico. El sistema valida que pertenezca al usuario autenticado.

**Request (Path Variables)**:

* `id`: El ID del registro de tiempo a eliminar.

**Response (204 NO CONTENT)**:
*(Cuerpo vacío)*
