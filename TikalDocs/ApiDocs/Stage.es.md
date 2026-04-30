<a id="top"></a>
# 🗂️ Documentación de endpoints de Fases (Stages)

Este documento describe todos los endpoints relacionados con la gestión de fases (columnas o agrupaciones de tareas) para la API de Tikal. Aquí encontrarás los formatos de solicitud requeridos y las respuestas esperadas para las operaciones de creación, lectura, actualización y borrado de las fases de los proyectos.

---

## 📋 Índice

- [Stage Controller](#stage-controller)
  - [1. Obtener mis fases](#1-obtener-mis-fases-get-apistage)
  - [2. Crear nueva fase](#2-crear-nueva-fase-post-apistage)
  - [3. Borrar fase](#3-borrar-fase-delete-apistageid)
  - [4. Actualizar fase](#4-actualizar-fase-patch-apistageid)

---

## Stage Controller

⚠️ **Importante:** Todos los endpoints de este controlador requieren autenticación. Debes incluir el `access_token` en la cabecera de la petición: `Authorization: Bearer <token>`.

### 1. Obtener mis fases (`Get /api/stage`)

**Propósito**: Obtiene una lista de todas las fases que pertenecen a los proyectos del usuario autenticado. Se utiliza para cargar la cascada de trabajo en la interfaz principal.

**Request (Headers)**: 
- `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:
Devuelve un array de objetos `StageDTO`.

```json
[
  {
    "id": 1,
    "name": "Bases de datos",
    "description": "Temario y prácticas de SQL",
    "colour": "y2",
    "deadline": "2026-06-15T23:59:00",
    "totalLoggedMinutes": 120,
    "templeLoggedMinutes": 45
  },
  {
    "id": 2,
    "name": "ADA",
    "description": "Análisis y Diseño de Algoritmos",
    "colour": "b5",
    "deadline": null,
    "totalLoggedMinutes": 0,
    "templeLoggedMinutes": 0
  }
]
```

### 2. Crear nueva fase (`Post /api/stage`)

**Propósito**: Crea una nueva fase y la asocia a un proyecto existente. El backend valida automáticamente que el usuario tenga permisos (ya sea como dueño del proyecto o como administrador del equipo) antes de realizar la inserción. Los contadores de tiempo se inicializan en 0 por defecto.

**Request (Headers)**: 
- `Content-Type: application/json`
- `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**:
El campo `projectId` y `name` son obligatorios. El resto son opcionales.

```json
{
  "projectId": 5,
  "name": "Sistemas Distribuidos",
  "description": "Fase para la entrega final",
  "colour": "v4",
  "deadline": "2026-12-20T18:00:00"
}
```

**Response (201 CREATED)**:

```json
{
  "id": 15,
  "name": "Sistemas Distribuidos",
  "description": "Fase para la entrega final",
  "colour": "v4",
  "deadline": "2026-12-20T18:00:00",
  "totalLoggedMinutes": 0,
  "templeLoggedMinutes": 0
}
```

### 3. Borrar fase (`Delete /api/stage/{id}`)

**Propósito**: Elimina permanentemente una fase de la base de datos. **Nota importante:** Debido a la configuración de borrado en cascada (Cascade Delete), eliminar una fase borrará automáticamente todas las tareas y subtareas que estén anidadas dentro de ella.

**Request (Headers)**: 
- `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: `id` (Integer) - El identificador único de la fase a borrar.

**Request (Body)**: *(Vacío)*

**Response (204 NO CONTENT)**: 
*(Cuerpo vacío, solo el código HTTP confirmando el éxito de la operación).*

### 4. Actualizar fase (`Patch /api/stage/{id}`)

**Propósito**: Actualiza de forma parcial los detalles de una fase existente. El cliente solo necesita enviar los campos que desea modificar. Los campos omitidos o enviados como nulos mantendrán su valor actual en la base de datos. Los tiempos de registro (`loggedMinutes`) no pueden modificarse por este endpoint por motivos de integridad.

**Request (Headers)**: 
- `Content-Type: application/json`
- `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: `id` (Integer) - El identificador único de la fase a editar.

**Request (Body)**:
*(Envía solo los campos que desees modificar)*

```json
{
  "name": "Bases de datos (Actualizado)",
  "colour": "#D35400"
}
```

**Response (200 OK)**:
Devuelve el objeto `StageDTO` con los datos actualizados.

```json
{
  "id": 1,
  "name": "Bases de datos (Actualizado)",
  "description": "Temario y prácticas de SQL",
  "colour": "#D35400",
  "deadline": "2026-06-15T23:59:00",
  "totalLoggedMinutes": 120,
  "templeLoggedMinutes": 45
}
```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>
