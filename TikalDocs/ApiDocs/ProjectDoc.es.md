<a id="top"></a>

# Documentación de endpoints de Proyectos

Este documento describe todos los endpoints relacionados con la gestión de proyectos para la API de Tikal. Aquí encontrarás los formatos de solicitud requeridos, las respuestas esperadas y el manejo de errores para las operaciones CRUD (Crear, Leer, Actualizar, Borrar) tanto de proyectos personales como grupales.

---

## 📋 Índice

* [Project Controller](#project-controller)
    * [1. Listar Mis Proyectos (Personales)](#1-listar-mis-proyectos-personales-get-apiprojects)
    * [2. Crear Proyecto](#2-crear-proyecto-post-apiprojects)
    * [3. Borrar Proyecto](#3-borrar-proyecto-delete-apiprojectsid)
    * [4. Listar Proyectos de Mis Equipos](#4-listar-proyectos-de-mis-equipos-get-apiprojectsteam)
    * [5. Actualizar Proyecto](#5-actualizar-proyecto-patch-apiprojectsid)


* [Manejo de Errores](#manejo-de-errores)
    * [Error 404 (No Encontrado)](#1-error-404-no-encontrado)
    * [Error 403 (Prohibido / Acceso Denegado)](#2-error-403-prohibido--acceso-denegado)
    * [Error 400 (Solicitud Incorrecta)](#3-error-400-solicitud-incorrecta)
    * [Error 401 (No Autorizado)](#4-error-401-no-autorizado)



---

## Project Controller

⚠️ **Importante:** Todos los endpoints de este controlador requieren autenticación. Debes incluir el `access_token` en la cabecera de la petición: `Authorization: Bearer <token>`.

### 1. Listar Mis Proyectos (Personales) (`GET /api/projects`)

**Propósito**: Obtener una lista de todos los proyectos personales que pertenecen al usuario autenticado. El ID del usuario se extrae de forma segura desde el token JWT, previniendo vulnerabilidades IDOR.

**Request (Headers)**:

* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:

```json
[
  {
    "id": 1,
    "name": "Mi Portfolio Personal",
    "description": "Rediseño de mi página web con React.",
    "logoUrl": "https://midominio.com/logo.png",
    "isGroupBased": false,
    "teamId": null,
    "teamName": null
  },
  {
    "id": 4,
    "name": "TFG",
    "description": "Documentación y desarrollo del backend.",
    "logoUrl": null,
    "isGroupBased": false,
    "teamId": null,
    "teamName": null
  }
]

```

### 2. Crear Proyecto (`POST /api/projects`)

**Propósito**: Crea un nuevo proyecto. Puede ser un proyecto personal o un proyecto de equipo. Si `isGroupBased` es `true`, el backend verifica rigurosamente que el usuario sea **administrador** del equipo indicado en `teamId` antes de permitir la creación.

**Request (Headers)**:

* `Content-Type: application/json`
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**:

```json
{
  "name": "Lanzamiento App Móvil",
  "description": "Fase 1: Diseño y Prototipado en Figma.",
  "logoUrl": "https://midominio.com/app-logo.png",
  "isGroupBased": true,
  "teamId": 3
}

```

*(Nota: Para proyectos personales, `isGroupBased` debe ser `false` o nulo, y `teamId` no es necesario).*

**Response (201 CREATED)**:

```json
{
  "id": 8,
  "name": "Lanzamiento App Móvil",
  "description": "Fase 1: Diseño y Prototipado en Figma.",
  "logoUrl": "https://midominio.com/app-logo.png",
  "isGroupBased": true,
  "teamId": 3,
  "teamName": "Desarrolladores Tikal"
}

```

### 3. Borrar Proyecto (`DELETE /api/projects/{id}`)

**Propósito**: Elimina un proyecto de la base de datos de forma permanente. Si el proyecto es personal, solo su creador puede borrarlo. Si el proyecto es grupal, solo los administradores del equipo asociado tienen permisos para ejecutar esta acción.

**Request (Headers)**:

* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Path Variable)**: `id` (Integer) - El identificador del proyecto a borrar.

**Response (204 NO CONTENT)**: *(Cuerpo vacío, solo el código HTTP confirmando el éxito de la operación).*

### 4. Listar Proyectos de Mis Equipos (`GET /api/projects/team`)

**Propósito**: Obtiene todos los proyectos que pertenecen a los diferentes equipos de los que el usuario forma parte (independientemente de si es administrador o miembro raso). Realiza una consulta optimizada para buscar coincidencias cruzadas entre las membresías del usuario y los equipos dueños de los proyectos.

**Request (Headers)**:

* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:

```json
[
  {
    "id": 12,
    "name": "Campaña de Marketing Q3",
    "description": "Estrategia para redes sociales.",
    "logoUrl": null,
    "isGroupBased": true,
    "teamId": 2,
    "teamName": "Departamento de Marketing"
  }
]

```

### 5. Actualizar Proyecto (`PATCH /api/projects/{id}`)

**Propósito**: Modifica parcialmente los datos de un proyecto existente (nombre, descripción o logo). Aplica las mismas validaciones de seguridad estrictas que el endpoint de borrado (solo dueño o administradores de equipo). Los campos omitidos o nulos en la petición no alteran el valor actual en la base de datos.

**Request (Headers)**:

* `Content-Type: application/json`
* `Authorization: Bearer eyJhbGciOiJIUz...`

**Request (Body)**: *(Envía solo los campos que desees modificar)*

```json
{
  "name": "Lanzamiento App Móvil - ACTUALIZADO",
  "description": "Aquí se van a ir apuntando las tareas sobre la aplicación movil que nos han ped...",
  "logoUrl": "https://midominio.com/nuevo-logo.png"
}

```

**Response (200 OK)**: *(Devuelve el DTO del proyecto con los datos actualizados)*

```json
{
  "id": 8,
  "name": "Lanzamiento App Móvil - ACTUALIZADO",
  "description": "Fase 1: Diseño y Prototipado en Figma.",
  "logoUrl": "https://midominio.com/nuevo-logo.png",
  "isGroupBased": true,
  "teamId": 3,
  "teamName": "Desarrolladores Tikal"
}

```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

---

## Manejo de Errores

### 1. Error 404 (No Encontrado)

Ocurre cuando el recurso solicitado no existe en la base de datos. Esto puede ser porque el ID del proyecto es incorrecto, o porque el equipo/membresía asociada no se encuentra.

```json
{
  "error": "Not found",
  "message": "Proyecto no encontrado."
}

```

*(Lanzado por: `NotFoundProjectException`)*

```json
{
  "error": "Not found",
  "message": "El usuario 'Hugo' no pertenece al equipo 'Desarrolladores Tikal'."
}

```

*(Lanzado por: `NotFoundTeamMemberException`)*

### 2. Error 403 (Prohibido / Acceso Denegado)

Se devuelve cuando el usuario está correctamente autenticado, pero intenta interactuar (crear, editar o borrar) con un proyecto sobre el que no tiene privilegios suficientes.

```json
{
  "error": "Access denied",
  "message": "Solo los administradores del equipo pueden borrar este proyecto grupal."
}

```

*(Lanzado por: `ProjectAccessDeniedException`)*

### 3. Error 400 (Solicitud Incorrecta)

Se dispara cuando la estructura de la petición contiene incoherencias lógicas de negocio, como intentar crear un proyecto grupal asignándolo a un equipo que no existe en el sistema.

```json
{
  "error": "Invalid data",
  "message": "El equipo asignado al proyecto 'Lanzamiento App Móvil' no existe o la solicitud es inválida."
}

```

*(Lanzado por: `TeamBadRequestException`)*

### 4. Error 401 (No Autorizado)

Ocurre a nivel de Filtro de Seguridad si la petición llega sin el token JWT en la cabecera, o si el token enviado está manipulado, roto o ha caducado.

```json
{
  "error": "Authentication failed",
  "message": "El token de acceso ha caducado. Actualice su sesión."
}

```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>
