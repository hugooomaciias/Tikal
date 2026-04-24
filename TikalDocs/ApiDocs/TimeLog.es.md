<a id="top"\>\</a\>

# ⏱️ Documentación de endpoints de Time Log

Este documento describe todos los endpoints correspondientes a la gestión de registros de tiempo (Time Logs) para la API. Aquí encontrarás los formatos de solicitud requeridos y las respuestas esperadas para las operaciones de consulta por día, creación, actualización y eliminación de registros de tiempo.

*Nota: Todos los endpoints de este controlador requieren autenticación, ya que las operaciones están vinculadas al usuario activo de la sesión.*

-----

## 📋 Índice

  - [Time Log Controller](#time-log-controller)
      - [1. Obtener Registros por Día](#1-obtener-registros-por-día-get-apitime_loglist_by_day)
      - [2. Crear Registro de Tiempo](#2-crear-registro-de-tiempo-post-apitime_log)
      - [3. Actualizar Registro de Tiempo](#3-actualizar-registro-de-tiempo-put-apitime_logid)
      - [4. Eliminar Registro de Tiempo](#4-eliminar-registro-de-tiempo-delete-apitime_logid)

-----

## Time Log Controller

### 1\. Obtener Registros por Día (`Get /api/time_log/list_by_day`)

**Propósito**: Recuperar todos los registros de tiempo asociados al usuario autenticado para un día en específico. El sistema filtra desde el inicio del día (00:00:00) hasta el final del mismo (23:59:59) y mapea los resultados calculando el nombre de la tarea (basándose en si es un proyecto, fase o tarea específica) y su respectivo color y logo.

**Request (Headers)**:

  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

**Request (Query Params)**:

  - `day` (LocalDate, formato `YYYY-MM-DD`): La fecha de la que se quieren obtener los registros.


```http
GET /api/time_log/list_by_day?day=2023-10-25 HTTP/1.1
```

**Response (200 OK)**:

```json
[
  {
    "id": 15,
    "initTime": "2023-10-25 09:00:00",
    "endTime": "2023-10-25 10:30:00",
    "minutes": 90,
    "logo": "https://ejemplo.com/logo-proyecto.png",
    "color": "y5",
    "taskName": "Desarrollo de API REST"
  },
  {
    "id": 16,
    "initTime": "2023-10-25 11:00:00",
    "endTime": "2023-10-25 11:45:00",
    "minutes": 45,
    "logo": null,
    "color": "b3",
    "taskName": "Reunión de equipo"
  }
]
```

*(Nota: El campo `taskName` tomará el nombre de la Tarea si existe; si no, tomará el de la Fase (Stage); y si no hay Fase, tomará el nombre del Proyecto).*

### 2\. Crear Registro de Tiempo (`Post /api/time_log`)

**Propósito**: Crear un nuevo registro de tiempo vinculado al usuario autenticado. Permite asociar el registro a un Proyecto, una Fase (Stage) o una Tarea de forma opcional (si se envían sus IDs). Si el campo `isTempleMode` no se envía, por defecto se guardará como `false`.

**Request (Headers)**:

  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

**Request (Body)**:

```json
{
  "initDateTime": "2023-10-25T09:00:00",
  "endDateTime": "2023-10-25T10:30:00",
  "targetTime": 120,
  "isTempleMode": false,
  "activityDescription": "Programación del controlador de autenticación",
  "projectId": 3,
  "stageId": 12,
  "taskId": 45
}
```

*(Nota: Los campos `stageId` y `taskId` son opcionales, pero si se envían, deben existir en la base de datos, el campo `projectId` es obligatorio).*

**Response (201 CREATED)**:

```json
{
  "id": 17,
  "initTime": "2023-10-25 09:00:00",
  "endTime": "2023-10-25 10:30:00",
  "minutes": 90,
  "logo": "https://ejemplo.com/logo-proyecto.png",
  "color": "y5",
  "taskName": "Implementación de Login"
}
```

### 3\. Actualizar Registro de Tiempo (`Put /api/time_log/{id}`)

**Propósito**: Modificar un registro de tiempo existente. Verifica previamente que el registro pertenezca al usuario autenticado. A diferencia de la creación, **durante la actualización es obligatorio enviar un `projectId`**, ya que el sistema exige que el registro pertenezca al menos a un proyecto/lista.

**Request (Headers)**:

  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

**Request (Path Variables)**:

  - `id` (Integer): El ID del registro de tiempo que se desea actualizar.

**Request (Body)**:

```json
{
  "initDateTime": "2023-10-25T09:30:00",
  "endDateTime": "2023-10-25T11:00:00",
  "targetTime": 90,
  "isTempleMode": true,
  "activityDescription": "Revisión de PRs y refactorización",
  "projectId": 3,
  "stageId": 12,
  "taskId": null
}
```

*(Nota: Si se envía `null` en `stageId` o `taskId`, se desvincularán del registro).*

**Response (200 OK)**:

```json
{
  "id": 17,
  "initTime": "2023-10-25 09:30:00",
  "endTime": "2023-10-25 11:00:00",
  "minutes": 90,
  "logo": "https://ejemplo.com/logo-proyecto.png",
  "color": "y5",
  "taskName": "Fase de Pruebas"
}
```

### 4\. Eliminar Registro de Tiempo (`Delete /api/time_log/{id}`)

**Propósito**: Eliminar permanentemente un registro de tiempo específico. Antes de proceder, el sistema valida que el registro exista y que pertenezca al usuario que está realizando la petición.

**Request (Headers)**:

  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

**Request (Path Variables)**:

  - `id` (Integer): El ID del registro de tiempo que se desea eliminar.

**Response (204 NO CONTENT)**:
*(Cuerpo vacío, solo el código HTTP confirmando que el recurso ha sido eliminado con éxito)*

<p align="right"\>
<a href="\#top"\>⬆️ Volver arriba\</a\>
</p\>