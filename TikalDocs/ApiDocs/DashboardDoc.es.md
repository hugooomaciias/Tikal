# 📊 Dashboard Sync API

Este documento describe el endpoint principal de sincronización del espacio de trabajo (Workspace). Es la petición más pesada de la aplicación y se encarga de servir toda la información necesaria para el primer renderizado del Dashboard del usuario.

## 📡 Endpoint Detalles

* **Ruta:** `GET /dashboard/sync`
* **Autenticación:** Requerida con *access_token* (`Bearer Token` en la cabecera `Authorization`)
* **Propósito:** Obtener el estado global del usuario, configuraciones, eventos próximos, y la data pre-calculada de todos los widgets del layout.

---

## 📦 Estructura del Payload (`WorkspaceSyncDTO`)

A continuación se muestra la estructura completa del JSON devuelto con datos de ejemplo. 

> **⚠️ Nota para Frontend:** 
> Los campos `homeWidgetsData` y `statisticsWidgetsData` son diccionarios dinámicos. Sus claves y estructuras internas dependen de los widgets activos del usuario. Para ver la estructura exacta de cada widget devuelto en estos mapas, consulta el documento `TheoryDocs/Widgets.md`.

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
          "progress": 3,
          "description": "3 / 10 h"
        },
        "targetProgress": 10,
        "totemImageUrl": "/images/totems/imix.svg",
        "isActive": true,
        "totemType": "CONCENTRATION"
      }
      // ... (resto de totems conseguidos por el usuario)
    ]
  },
  
  "settings": {
    "focusSessionMinutes": 25,
    "themeSetting": "DARK",
    "userLanguage": "es_ES"
    // ... (resto de preferencias del usuario)
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
      "value": 12
    },
    {
      "title": "Minutos hoy",
      "logo": "/icons/timer.svg",
      "value": 145
    }
  ],
  
  "homeWidgetsData": {
    "templeModeWidget": { "REF": "Ver TheoryDocs/Widgets.md" },
    "taskWidget": { "REF": "Ver TheoryDocs/Widgets.md" },
    "weeklyProgressWidget": { "REF": "Ver TheoryDocs/Widgets.md" }
  },
  
  "statisticsGeneralInformation": [
    {
      "title": "Horas registradas",
      "logo": "/icons/chart-bar.svg",
      "value": 2083
    }
  ],
  
  "statisticsWidgetsData": {
    "solarChartWidget": { "REF": "Ver TheoryDocs/Widgets.md" },
    "comparisonWidget": { "REF": "Ver TheoryDocs/Widgets.md" }
  },

  "projects": [
    {
      "id": 1,
      "name": "Tikal MVP",
      "color": "#FF5733"
      // ... (estructura del proyecto)
    }
  ]
}
```

---

## 🧠 Consideraciones de Negocio y Reglas para el Frontend

### 1. Ventana Táctica del Calendario (`calendarEvents`)
**No se envía el histórico completo de eventos** por motivos de rendimiento. El array `calendarEvents` contiene únicamente una ventana táctica de datos:
* **Desde:** El primer día del mes anterior (00:00:00).
* **Hasta:** El último día de dentro de 3 meses (23:59:59).
* *Nota:* Para navegar fuera de este rango temporal, el frontend deberá utilizar la paginación dinámica llamando al endpoint específico de calendario (Pendiente de documentar).

### 2. Estado Vacío de Tótems (`totems`)
Si el usuario es completamente nuevo, las listas de `totems` en `userProfile` llegarán vacías `[]`. El frontend debe manejar de forma segura el estado de inventario vacío mostrando placeholders.

### 3. Información del Header (`GeneralInformation`)
El campo `value` siempre se envía como un número entero (`Integer`). Si el negocio requiere mostrar horas en lugar de minutos en la cabecera de estadísticas, la conversión ya viene procesada y dividida desde el Backend. El Frontend solo debe renderizar el valor.
