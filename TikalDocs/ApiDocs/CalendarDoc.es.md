# Documentación del Módulo de Calendario (Tikal)

Este módulo gestiona los eventos de calendario de los usuarios en Tikal. A diferencia de un calendario tradicional, los eventos aquí están fuertemente acoplados a las entidades de gestión de proyectos (Proyectos, Fases y Tareas) y al sistema de tracking de tiempo.

## 1. Reglas de Negocio Centrales

### 1.1 Gestión del Tiempo (UTC First)
Toda la lógica del calendario opera estrictamente en **UTC (Meridiano 0)** usando la clase `Instant`. 
* Las conversiones a zonas horarias locales son responsabilidad exclusiva del frontend.
* **Filtros por defecto (Fallback):** Si el frontend solicita eventos mediante un `GET` sin especificar fechas, el controlador asigna dinámicamente el mes actual completo (desde el día 1 a las 00:00:00 hasta el último día a las 23:59:59) en UTC.

### 1.2 Eventos de Día Completo (`isCompleteDay`)
Cuando un usuario marca un evento como "Todo el día", el backend sobrescribe las horas de inicio y fin para abarcar exactamente los límites del día asociado a la fecha solicitada:
* `InitDateTime` se fuerza a las `00:00:00 UTC` de ese día.
* `EndDateTime` se fuerza a las `23:59:59 UTC` de ese día.
Esto asegura que el evento ocupe la franja completa en la base de datos sin importar la hora exacta que haya enviado el frontend en su payload inicial.

### 1.3 Enlace Jerárquico de Entidades (`Linked Entities`)
Un evento puede enlazarse a una Tarea, a una Fase o a un Proyecto. El servicio (`CalendarEventService`) resuelve la jerarquía completa automáticamente de abajo hacia arriba:
* **Si se enlaza a una Tarea:** El evento asocia automáticamente la Tarea, hereda la Fase de esa tarea y el Proyecto de esa fase.
* **Si se enlaza a una Fase:** El evento asocia la Fase y su Proyecto correspondiente. Si el evento no trae color personalizado, hereda por defecto el color de la Fase.
* **Si se enlaza a un Proyecto:** El evento asocia únicamente el Proyecto.

Para facilitar la renderización en el frontend, el DTO expone el campo `linkedEntity` usando prefijos semánticos: `p_{id}` (Proyecto), `f_{id}` (Fase), o `t_{id}` (Tarea).

### 1.4 Tipos de Eventos y Tracking
Existen tres tipos de eventos (`EventType`): `WORK_SESSION`, `GENERAL` y `DEADLINE`.
* Solo los eventos de tipo `WORK_SESSION` pueden tener activa la flag `isActivateTracker`.
* Si un evento `GENERAL` o `DEADLINE` intenta activar el tracker, el backend fuerza la variable a `false` por seguridad.

---

## 2. API Endpoints (Resumen de Controladores)

| Método | Endpoint | Propósito | Reglas Especiales |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/calendar_event` | Obtener eventos por rango | Si `start`/`end` son nulos, devuelve el mes actual UTC. |
| `POST` | `/api/calendar_event` | Crear evento | Resuelve jerarquía de entidades automáticamente. |
| `PUT` | `/api/calendar_event/{id}` | Actualización completa | Valida propiedad del evento (autorización). |
| `PATCH` | `/api/calendar_event/{id}/time` | Arrastrar/Redimensionar | Endpoint ligero optimizado para *Drag & Drop* en UI. |
| `DELETE` | `/api/calendar_event/{id}` | Eliminar evento | Valida propiedad del evento. |

*Nota:* para saber más sobre los endpoints miradlo en swagger: [localhost:8080/swagger-ui/index.html](localhost:8080/swagger-ui/index.html)

---

## 3. Arquitectura Futura: Contabilización Automática (Cron/Scheduled)

El diseño actual sienta las bases para un sistema de **procesamiento asíncrono y automático de tiempos**. En futuras iteraciones, se implementará un proceso automatizado (`@Scheduled` en Spring Boot) para gestionar los eventos en espera.

### Flujo previsto para el Motor Automático:
1. **Identificación:** Un *job* recurrente buscará eventos de tipo `WORK_SESSION` que hayan superado su `EndDateTime`, que tengan `isActivateTracker = true` y que no hayan sido procesados aún.
2. **Transformación:** El sistema leerá la duración exacta del evento (diferencia entre inicio y fin).
3. **Imputación (Auto-Accounting):** 
   * Se generará automáticamente un registro en la tabla `TimeLog`.
   * Los minutos calculados se imputarán directamente a la entidad enlazada (`Task`, `Stage` o `Project`) sin intervención manual del usuario.
4. **Cierre:** El evento se marcará como procesado para no volver a contabilizarse en la siguiente ejecución del Cron.

*Nota técnica para futura implementación:* Este Job deberá ser transaccional (`@Transactional`) para garantizar que la creación del `TimeLog` y la actualización del estado del evento ocurran de forma atómica, evitando horas duplicadas en caso de caída del servidor durante el proceso.