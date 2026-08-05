## TimeLog Widget (Historial de 7 días)

Este nodo del dashboard devuelve el historial de registros de tiempo (`TimeLogs`) del usuario, limitado a una ventana móvil de los **últimos 7 días** (Rolling Week) para optimizar el rendimiento.

Los datos ya vienen pre-procesados desde el backend: agrupados por día y doblemente ordenados, listos para ser renderizados directamente sin lógica compleja en el cliente.

### Estructura y Ordenación

El payload principal es un array de días (`days`).

* **Orden de los días:** Descendente (el "Hoy" o el día más reciente siempre estará en la posición `days[0]`).
* **Orden de los logs:** Descendente dentro de cada día (el registro más reciente, o el que está en ejecución, aparece primero en la lista).

**Ejemplo de Payload:**

```json
{
  "days": [
    {
      "date": "2026-08-02",
      "logs": [
        {
          "timeLogId": 142,
          "initTime": "2026-08-02T08:15:00Z",
          "endTime": null,
          "entityName": "Desarrollo del TimeLogWidget",
          "projectId": 3,
          "stageId": 12,
          "taskId": 45,
          "color": "blue-500",
          "icon": "IconCode",
          "durationInSeconds": 0,
          "isTempleMode": false
        },
        {
          "timeLogId": 141,
          "initTime": "2026-08-02T07:00:00Z",
          "endTime": "2026-08-02T08:00:00Z",
          "entityName": "Daily Meeting",
          "projectId": 3,
          "stageId": 11,
          "taskId": null,
          "color": "green-400",
          "icon": "IconUsers",
          "durationInSeconds": 3600,
          "isTempleMode": true
        }
      ]
    }
  ]
}
```

### Guía de Integración para Frontend

1. **El Timer Activo (En ejecución):**

* Si `endTime` es `null`, significa que ese bloque de tiempo está corriendo *ahora mismo*.
* En este escenario, `durationInSeconds` vendrá a `0`. Debes ignorarlo y utilizar `initTime` (que siempre llega en UTC) para calcular y pintar el cronómetro en vivo respetando la zona horaria del dispositivo del usuario.

2. **Tiempos Finalizados:**

* Si `endTime` tiene valor, el temporizador está cerrado.
* **No calcules la diferencia de fechas en el front**. Utiliza directamente el campo `durationInSeconds` y pásalo por tu función de formateo para pintar la pastilla de tiempo (ej. `"3h 5m"` o `"25m"`). *Nota: Si el tiempo no llega a un minuto, la vista debe representarlo estáticamente como `"0m"`.*

3. **Edición, Eliminación y Jerarquía (Modal):**

* Cada log incluye su `timeLogId`, el identificador único indispensable para hacer las llamadas `PUT` (editar) o `DELETE` (borrar).
* Para facilitar el rellenado del formulario en el modal de edición, el log te devuelve la jerarquía de origen resuelta de forma *Bottom-Up*: `projectId`, `stageId` y `taskId`. Usa estos IDs para dejar los *dropdowns* pre-seleccionados cuando el usuario haga clic en la pastilla.
* ⚠️ **Restricción de Modo Templo:** Si la propiedad `isTempleMode` viene a `true`, el registro es **de solo lectura**. El frontend debe deshabilitar los inputs o bloquear el acceso al modal de edición para evitar que el usuario manipule los metadatos de una sesión ininterrumpible.

4. **Estado Vacío (Empty State):**

* Si el usuario es nuevo o no ha registrado tiempo en la última semana, el array `days` vendrá vacío (`[]`). Aprovecha este estado para renderizar el componente visual de *Empty State* correspondiente.