# Dashboard & Temple Sync API

Este documento describe los endpoints principales para la obtención del estado del espacio de trabajo (Workspace) y las actualizaciones ligeras del Modo Templo.

---

## 1. Sincronización Completa (`/dashboard/sync`)

Es la petición más pesada de la aplicación. Se encarga de servir toda la información necesaria para el primer renderizado del Dashboard del usuario.

* **Ruta:** `GET /dashboard/sync`
* **Autenticación:** Requerida con *access_token* (`Bearer Token` en la cabecera `Authorization`)
* **Propósito:** Obtener el estado global del usuario, configuraciones, eventos próximos, y la data pre-calculada de todos los widgets del layout.

### Estructura del Payload (`WorkspaceSyncDTO`)

A continuación se muestra la estructura completa del JSON devuelto.

> **⚠️ Nota para Frontend:**
> Los campos `homeWidgetsData` y `statisticsWidgetsData` son diccionarios dinámicos. Para ver la estructura exacta de cada widget devuelto en estos mapas, consulta el documento `TheoryDocs/Widgets.md`.

```json
{
  "userProfile": {
    "name": "Alex",
    "email": "alex@tikal.com",
    "avatarUrl": "/images/avatar/default.png",
    "subscriptionPlan": "COMUNITARIO",
    "totems": [
      {
        "id": 1,
        "name": "IMIX",
        "goalDescription": "Alcanza 10 horas totales de concentración",
        "currentProgress": {
          "progress1": 3,
          "progress2": null,
          "description1": "3 / 10 h",
          "description2": null
        },
        "targetProgress1": 10,
        "targetProgress2": null,
        "totemImageUrl": "/images/totems/imix.svg",
        "isActive": true,
        "justUnlocked": false,
        "totemType": "CONCENTRATION",
        "rank": 1
      }
    ]
  },
  
  "settings": {
    "focusSessionMinutes": 25,
    "themeSetting": "DARK",
    "userLanguage": "es_ES"
  },
  
  "templeMode": {
    "rank": 2,
    "templeName": "Templo del Camino Interior",
    "awardedTitle": "Iniciado del Agua y del Fuego",
    "requiredHours": 80,
    "currentHours": 85,
    "badgeImageUrl": "/images/badges/water_fire.png",
    "clockImageUrl": "/images/clocks/temple_2.png",
    "templeImageUrl": "/images/temples/temple_2.png",
    "primaryColor": "#E25822",
    "totems": [
       // Lista de tótems específicos de este nivel (Misma estructura que userProfile.totems)
    ]
  },
  
  "calendarEvents": [
    {
      "id": 1045,
      "title": "Reunión de Arquitectura",
      "description": "Definición de endpoints para el MVP",
      "startDate": "2023-11-15T10:00:00",
      "endDate": "2023-11-15T11:30:00",
      "color": "#6A98F0"
    }
  ],
  
  "homeGeneralInformation": [
    {
      "title": "Tareas pendientes",
      "logo": "/icons/tasks-pending.svg",
      "value": "12"
    }
  ],
  
  "homeWidgetsData": {
    "templeModeWidget": { "REF": "Ver TheoryDocs/Widgets.md" }
  },
  
  "statisticsGeneralInformation": [
    {
      "title": "Horas registradas",
      "logo": "/icons/chart-bar.svg",
      "value": "20:30"
    }
  ],
  
  "statisticsWidgetsData": {
    "solarChartWidget": { "REF": "Ver TheoryDocs/Widgets.md" }
  },

  "gamificationEvents": [
    {
      "type": "RANK_UP",
      "title": "¡Enhorabuena!",
      "message": "Has subido de rango: Iniciado del Agua y del Fuego",
      "imageUrl": "/images/badges/water_fire.png"
    }
  ],

  "projects": [
    {
      "id": 1,
      "name": "Tikal MVP",
      "color": "#FF5733"
    }
  ]
}

```

---

## 2. Actualización Ligera del Templo (`/dashboard/temple-status`)

Endpoint optimizado para refrescar dinámicamente el progreso del Modo Templo sin necesidad de recargar todo el dashboard.

* **Ruta:** `GET /dashboard/temple-status`
* **Autenticación:** Requerida con *access_token*
* **Propósito:** Se debe llamar justo después de que el usuario finalice una sesión de concentración (temporizador) para comprobar si ha subido de rango, conseguido un tótem o para actualizar las barras de progreso.

### Estructura del Payload (`TempleUpdateResponse`)

Devuelve únicamente el nodo `templeMode` actualizado y los eventos que se hayan disparado durante esta comprobación.

```json
{
  "templeMode": {
    "rank": 2,
    "templeName": "Templo del Camino Interior",
    "awardedTitle": "Iniciado del Agua y del Fuego",
    "requiredHours": 80,
    "currentHours": 85,
    "badgeImageUrl": "/images/badges/water_fire.png",
    "clockImageUrl": "/images/clocks/temple_2.png",
    "templeImageUrl": "/images/temples/temple_2.png",
    "primaryColor": "#E25822",
    "totems": [
      {
        "id": 2,
        "name": "KIB",
        "goalDescription": "Alcanza efectividad > 85%",
        "currentProgress": {
          "progress1": 85,
          "progress2": null,
          "description1": "Porcentaje de efectividad global",
          "description2": null
        },
        "targetProgress1": 85,
        "targetProgress2": null,
        "totemImageUrl": "/images/totems/kib.svg",
        "isActive": true,
        "justUnlocked": true,
        "totemType": "EFFECTIVENESS",
        "rank": 2
      }
    ]
  },
  "events": [
    {
      "type": "TOTEM_UNLOCKED",
      "title": "¡Tótem Desbloqueado!",
      "message": "Has conseguido el tótem: KIB",
      "imageUrl": "/images/totems/kib.svg"
    }
  ]
}

```

---

## Consideraciones de Negocio y Reglas para el Frontend

### 1. Sistema de Notificaciones (`gamificationEvents` / `events`)

El backend utiliza un modelo *Just-In-Time*. Los eventos (`RANK_UP`, `TOTEM_UNLOCKED`, `TEMPLE_FAILED`) se calculan y envían **en el mismo instante** en que se solicita la sincronización.

* Si el array llega con elementos, el Frontend debe encolarlos y mostrarlos secuencialmente al usuario (ej. mediante modales o toasts).
* Si el array llega vacío (`[]`), no hay notificaciones nuevas.

### 2. Ventana Táctica del Calendario (`calendarEvents`)

**No se envía el histórico completo de eventos** por motivos de rendimiento. El array `calendarEvents` contiene únicamente una ventana táctica de datos:

* **Desde:** El primer día del mes anterior (00:00:00).
* **Hasta:** El último día de dentro de 3 meses (23:59:59).

### 3. Renderizado de Progreso de Tótems

* Si `isActive: true`, el usuario ya posee el tótem. El frontend debe ignorar los cálculos matemáticos (el progreso está al 100%) y renderizar la interfaz mostrando el objetivo cumplido (Ej: `targetProgress1 / targetProgress1`).
* El booleano `justUnlocked` sirve como flag adicional para disparar animaciones locales en la interfaz justo en el momento en que se adquiere.

### 4. Información del Header (`GeneralInformation`)

El campo `value` se envía como un `String` formateado. Si el negocio requiere mostrar horas y minutos (ej: `"20:30"`), la conversión ya viene procesada desde el Backend. El Frontend solo debe imprimir la cadena de texto directamente.