<a id="top"></a>

# Documentación de endpoints de Tareas

Este documento describe todos los endpoints relacionados con la gestión de tareas y subtareas para la API de Tikal. Aquí encontrarás los formatos de solicitud requeridos y las respuestas esperadas para las operaciones de lectura con carga diferida (lazy loading), así como la creación en cascada.

---

## 📋 Índice

* [Task Controller](#task-controller)
    * [1. Obtener tareas por Fase](#1-obtener-tareas-por-fase-get-apitaskby_stagestageid)
    * [2. Obtener subtareas de un Padre](#2-obtener-subtareas-de-un-padre-get-apitasksubtaskparentid)
    * [3. Crear Tarea (y Subtareas)](#3-crear-tarea-y-subtareas-post-apitask)
    * [4. Actualizar Tarea (Pendiente)](#4-actualizar-tarea-patch-apitaskid)
    * [5. Borrar Tarea (Pendiente)](#5-borrar-tarea-delete-apitaskid)

---

## Task Controller

⚠️ **Importante:** Todos los endpoints de este controlador requieren autenticación. Debes incluir el `access_token` en la cabecera de la petición: `Authorization: Bearer <token>`. 

El backend asume que todas las operaciones de creación y lectura de este controlador se realizan en el contexto del **usuario autenticado**.

### 1. Obtener tareas por Fase (`GET /api/task/by_stage/{stageId}`)

**Propósito**: Obtener una lista de todas las tareas principales (padres) que pertenecen a una fase (`Stage`) específica. **No devuelve las subtareas anidadas** por motivos de rendimiento; en su lugar, devuelve un contador (`subtasksCount`) para que el frontend sepa si debe mostrar un botón de expandir.

**Request (Headers)**:
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: 
* `stageId` (Integer) - El identificador de la fase (columna) cuyas tareas se quieren cargar.

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:
```json
[
  {
    "id": 101,
    "name": "Hacer práctica 1",
    "description": "Práctica de la asignatura de Bases de Datos",
    "estimatedTime": 120,
    "isCompleted": true,
    "completionDate": "2026-04-10T18:30:00",
    "estimatedProfit": 0.00,
    "deadline": "2026-04-15T23:59:00",
    "totalLoggedMinutes": 90,
    "templeLoggedMinutes": 45,
    "subtasksCount": 5
  },
  {
    "id": 102,
    "name": "Estudiar parcial 1",
    "description": null,
    "estimatedTime": 240,
    "isCompleted": false,
    "completionDate": null,
    "estimatedProfit": 0.00,
    "deadline": "2026-04-20T10:00:00",
    "totalLoggedMinutes": 0,
    "templeLoggedMinutes": 0,
    "subtasksCount": 0
  }
]
```

### 2. Obtener subtareas de un Padre (`GET /api/task/subtask/{parentId}`)

**Propósito**: Endpoint diseñado para la *carga diferida (lazy loading)*. Se utiliza cuando el usuario expande una tarea en el frontend para ver qué contiene dentro. Devuelve la lista de tareas hijas asociadas a la tarea padre indicada.

**Request (Headers)**:
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: 
* `parentId` (Integer) - El identificador de la tarea principal que contiene las subtareas.

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:
```json
[
  {
    "id": 201,
    "name": "Reunión con equipo",
    "description": null,
    "estimatedTime": 30,
    "isCompleted": true,
    "completionDate": "2026-04-12T10:00:00",
    "estimatedProfit": null,
    "deadline": null,
    "totalLoggedMinutes": 35,
    "templeLoggedMinutes": 0,
    "subtasksCount": 0
  },
  {
    "id": 202,
    "name": "Desarrollar código (1ª parte)",
    "description": null,
    "estimatedTime": 90,
    "isCompleted": false,
    "completionDate": null,
    "estimatedProfit": null,
    "deadline": null,
    "totalLoggedMinutes": 0,
    "templeLoggedMinutes": 0,
    "subtasksCount": 0
  }
]
```

### 3. Crear Tarea (y Subtareas) (`POST /api/task`)

**Propósito**: Crea una nueva tarea principal dentro de una fase concreta. Opcionalmente, permite enviar una lista de subtareas en la misma petición (creación en cascada). El backend se encarga automáticamente de asignar el usuario autenticado y vincular las subtareas a la misma fase que su padre.

**Request (Headers)**:
* `Content-Type: application/json`
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**: *(La lista `subtasks` es opcional. Por diseño de UI, las subtareas solo admiten nombre, tiempo y beneficio).*
```json
{
  "name": "Hacer entrega 1 (Grupo)",
  "description": "Preparar el repositorio y la memoria técnica.",
  "estimatedTime": 150,
  "estimatedProfit": 0.00,
  "deadline": "2026-04-18T23:59:00",
  "stageId": 5,
  "subtasks": [
    {
      "name": "Revisar commits de la rama main",
      "estimatedTime": 30,
      "estimatedProfit": 0.00
    },
    {
      "name": "Redactar PDF de arquitectura",
      "estimatedTime": 120,
      "estimatedProfit": 0.00
    }
  ]
}
```

**Response (201 CREATED)**: *(Devuelve la tarea padre creada, reflejando el conteo de subtareas generadas)*
```json
{
  "id": 105,
  "name": "Hacer entrega 1 (Grupo)",
  "description": "Preparar el repositorio y la memoria técnica.",
  "estimatedTime": 150,
  "isCompleted": false,
  "completionDate": null,
  "estimatedProfit": 0.00,
  "deadline": "2026-04-18T23:59:00",
  "totalLoggedMinutes": 0,
  "templeLoggedMinutes": 0,
  "subtasksCount": 2
}
```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

***

### 4. Actualizar Tarea (`PATCH /api/task/{id}`)

**Propósito**: Modifica los datos de una tarea existente. Sigue el patrón **PATCH real** (Actualización Parcial): el cliente solo necesita enviar en el JSON los campos que desea cambiar. Los campos omitidos o enviados como `null` serán ignorados por el backend, preservando intactos los datos originales en la base de datos.

**Request (Headers)**:
* `Content-Type: application/json`
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: 
* `id` (Integer) - El identificador de la tarea a modificar.

**Reglas de Negocio Clave (Automatizaciones del Backend):**

1.  **Gestión del Tiempo (`completionDate`)**: 
    * Si se envía `"isCompleted": true`, el backend registrará automáticamente la fecha y hora actuales como fecha de finalización.
    * Si se envía `"isCompleted": false`, el backend borrará (pondrá a null) la fecha de finalización existente.
2.  **Movimiento entre Fases (`stageId`)**: 
    * Si se actualiza el `stageId` de una tarea padre, el backend **moverá automáticamente todas sus subtareas** a esa nueva fase para mantener la coherencia de la base de datos.
3.  **Jerarquías y Drag & Drop (`parentTaskId`)**:
    * **Anidar:** Enviar un `parentTaskId` válido moverá la tarea actual como hija de ese nuevo padre (heredando también su fase).
    * **Desvincular:** Enviar `"parentTaskId": -1` desvinculará a la subtarea de su padre, convirtiéndola en una tarea principal (raíz) independiente.
    * **Seguridad:** El backend rechazará intentos de hacer que una tarea sea hija de sí misma, o crear jerarquías de más de dos niveles (nietos).

**Request (Body)**: *(Ejemplo de un payload donde el usuario arrastra una tarea a otra columna y la marca como completada).*
```json
{
  "name": "Hacer entrega 1 (Grupo) - REVISADO",
  "isCompleted": true,
  "stageId": 6,
  "parentTaskId": null 
}
```

**Response (200 OK)**: *(Devuelve la tarea con los datos ya mutados y las fechas autogeneradas).*
```json
{
  "id": 105,
  "name": "Hacer entrega 1 (Grupo) - REVISADO",
  "description": "Preparar el repositorio y la memoria técnica.",
  "estimatedTime": 150,
  "isCompleted": true,
  "completionDate": "2026-04-18T09:45:00",
  "estimatedProfit": 0.00,
  "deadline": "2026-04-18T23:59:00",
  "totalLoggedMinutes": 140,
  "templeLoggedMinutes": 60,
  "subtasksCount": 2
}
```

### 5. Borrar Tarea (`DELETE /api/task/{id}`)

**Propósito**: Elimina permanentemente una tarea de la base de datos. Este endpoint está protegido por una validación de existencia previa para evitar errores silenciosos.

**Comportamiento en Cascada (Cascade Delete)**:
Gracias a la arquitectura de la base de datos, si el ID proporcionado pertenece a una **tarea padre**, el backend eliminará automáticamente esa tarea **y todas sus subtareas anidadas**. No quedarán registros huérfanos.

**Request (Headers)**:
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: 
* `id` (Integer) - El identificador de la tarea (o subtarea) a borrar.

**Response (204 NO CONTENT)**: 
* *(Cuerpo vacío)*. Solo se devuelve el código HTTP 204 confirmando que la eliminación en cascada se ejecutó con éxito.
* Si la tarea no existe, devolverá un error 404 (`NotFoundTaskException`).

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>
