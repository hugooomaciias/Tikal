<a id="top"></a>

# ⚙️ Documentación de endpoints de Configuración (Settings)

Este documento describe todos los endpoints relacionados con las preferencias y configuraciones del usuario para la API de Tikal. Aquí encontrarás los formatos de solicitud requeridos, las respuestas esperadas y el manejo de errores para obtener y actualizar la configuración general, el diseño del dashboard, las preferencias de los widgets y las notificaciones.

---

## 📋 Índice

* [User Settings Controller](#user-settings-controller)
    * [1. Obtener mi configuración](#1-obtener-mi-configuración-get-settings)
    * [2. Actualizar toda mi configuración](#2-actualizar-toda-mi-configuración-put-settings)
    * [3. Actualizar diseño del dashboard](#3-actualizar-diseño-del-dashboard-patch-settingslayout)
    * [4. Actualizar preferencias de widgets](#4-actualizar-preferencias-de-widgets-patch-settingswidget-preferences)
    * [5. Actualizar configuración de notificaciones](#5-actualizar-configuración-de-notificaciones-patch-settingsnotification-preferences)


* [Manejo de Errores](#manejo-de-errores)
    * [Error 401 (No Autorizado)](#1-error-401-no-autorizado)
    * [Error 404 (No Encontrado)](#2-error-404-no-encontrado)
    * [Error 400 (Solicitud Incorrecta)](#3-error-400-solicitud-incorrecta)


---

## User Settings Controller

Todas las rutas de este controlador están protegidas y requieren que el usuario esté autenticado.

**Headers obligatorios para todos los endpoints:**
`Authorization: Bearer <access_token>`

### 1. Obtener mi configuración (`Get /settings`)

**Propósito**: Devuelve todas las preferencias del usuario logueado. Si es la primera vez que el usuario accede y no tiene configuración previa, el servidor crea una por defecto automáticamente (con listas y mapas vacíos o valores predeterminados) y la devuelve.

**Request (Body)**: *(Vacío)*

**Response (200 OK)**:
Devuelve un objeto `UserSettingsDTO` con todas las preferencias.

```json
{
  "theme": "MAYA",
  "timeRange": "SEMANAL",
  "hoursGoal": 40,
  "focusSessionMinutes": 25,
  "timezone": "Europe/Madrid",
  "firstDayOfWeek": "LUNES",
  "showRankInTeam": true,
  "layoutsDashboards": {
    "home": [],
    "statistics": [],
    "team": []
  },
  "widgetPreferences": {
    "preferences": {}
  },
  "notificationSettings": {
    "email": {
      "weeklySummary": true,
      "teamInvites": true,
      "marketing": false
    },
    "inApp": {
      "chatMentions": true,
      "taskAssignments": true,
      "soundEnabled": true
    },
    "push": {
      "templeModeEnd": true
    }
  }
}

```

### 2. Actualizar toda mi configuración (`Put /settings`)

**Propósito**: Sobrescribe la configuración completa del usuario. Recibe el DTO completo modificado por el cliente y actualiza los valores en la base de datos. Si no se envían los metadatos JSON (`layoutsDashboards`, `widgetPreferences`, `notificationSettings`), estos mantendrán sus valores anteriores.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "theme": "OSCURO",
  "timeRange": "MENSUAL",
  "hoursGoal": 120,
  "focusSessionMinutes": 50,
  "timezone": "America/Mexico_City",
  "firstDayOfWeek": "DOMINGO",
  "showRankInTeam": false,
  "layoutsDashboards": {
    "home": [
      {
        "i": "widget_1",
        "x": 0,
        "y": 0,
        "w": 1,
        "h": 1
      }
    ],
    "statistics": [],
    "team": []
  },
  "widgetPreferences": {
    "preferences": {
      "widget_1": {
        "hiddenProjects": [1, 2]
      }
    }
  },
  "notificationSettings": {
    "email": {
      "weeklySummary": false,
      "teamInvites": true,
      "marketing": false
    },
    "inApp": {
      "chatMentions": true,
      "taskAssignments": false,
      "soundEnabled": false
    },
    "push": {
      "templeModeEnd": true
    }
  }
}

```

**Response (200 OK)**:
Devuelve el `UserSettingsDTO` actualizado tras ser guardado.

### 3. Actualizar diseño del dashboard (`Patch /settings/layout`)

**Propósito**: Actualiza de forma parcial la configuración, modificando **únicamente** las posiciones y la organización de las cajas del dashboard (para el home, statistics o team). Ideal para guardar el layout cuando el usuario arrastra y suelta elementos en el frontend.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:
Envía únicamente el objeto `LayoutsDashboardMetadata`.

```json
{
  "home": [
    {
      "i": "chart_widget",
      "x": 0,
      "y": 0,
      "w": 2,
      "h": 1
    }
  ],
  "statistics": [],
  "team": []
}

```

**Response (200 OK)**:
Devuelve el `UserSettingsDTO` completo con el layout actualizado.

### 4. Actualizar preferencias de widgets (`Patch /settings/widget-preferences`)

**Propósito**: Actualiza de forma parcial **únicamente** los filtros internos y la configuración dinámica de los widgets (almacenados en un mapa flexible).

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:
Envía únicamente el objeto `WidgetPreferencesMetadata`.

```json
{
  "preferences": {
    "chart_widget": {
      "chartType": "bar",
      "showLegend": false
    }
  }
}

```

**Response (200 OK)**:
Devuelve el `UserSettingsDTO` completo con las preferencias actualizadas.

### 5. Actualizar configuración de notificaciones (`Patch /settings/notification-preferences`)

**Propósito**: Actualiza de forma parcial **únicamente** las preferencias del usuario sobre qué notificaciones desea recibir por correo electrónico, dentro de la aplicación o mediante notificaciones push.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:
Envía únicamente el objeto `NotificationSettingsMetadata`.

```json
{
  "email": {
    "weeklySummary": false,
    "teamInvites": true,
    "marketing": false
  },
  "inApp": {
    "chatMentions": true,
    "taskAssignments": true,
    "soundEnabled": false
  },
  "push": {
    "templeModeEnd": false
  }
}

```

**Response (200 OK)**:
Devuelve el `UserSettingsDTO` completo con la configuración de notificaciones actualizada.

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

---

## Manejo de Errores

### 1. Error 401 (No Autorizado)

Ocurre en cualquiera de los endpoints si el cliente no envía el token JWT en la cabecera, si el token ha caducado, o si está malformado.

```json
{
  "error": "Authentication failed",
  "message": "No se proporcionó un token de acceso o el token no es válido."
}

```

### 2. Error 404 (No Encontrado)

Este error puede ocurrir internamente al llamar a los endpoints si el sistema intenta buscar la configuración para un usuario cuyo ID extraído del token ya no existe en la base de datos (por ejemplo, si el usuario fue eliminado manualmente).

```json
{
  "error": "Not found",
  "message": "Usuario no encontrado."
}

```

### 3. Error 400 (Solicitud Incorrecta)

Ocurre en los métodos `PUT` y `PATCH` si el JSON enviado por el cliente está mal estructurado, contiene valores inválidos que no pueden ser mapeados a los enumerados, o los tipos de datos no coinciden.

```json
{
  "error": "Invalid data",
  "message": "El formato de los datos enviados es incorrecto."
}

```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>
