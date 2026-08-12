# Documentación Lógica de Estadísticas (Gamificación)

Este documento detalla el funcionamiento interno, los filtros y las fórmulas matemáticas utilizadas en el `StatisticsService` para calcular los porcentajes de **Efectividad Global** y **Precisión de Planificación** de los usuarios.

---

## 1. El Embudo de Validación (Requisitos Previos)

Antes de que una tarea compute para las estadísticas de un usuario, el sistema aplica un filtrado estricto a través de la base de datos y la lógica del servicio. Si una tarea no cumple **todos** estos requisitos, se ignora y no penaliza ni suma a la media:

*   **Estado completado:** La tarea debe estar marcada como `isCompleted = true`.
*   **Fecha de finalización válida:** Debe tener un `completionDate` registrado que entre dentro del rango de tiempo solicitado (Semanal, Mensual, Trimestral, Anual y Global).
*   **Tarea Principal:** Debe ser una tarea padre (`parentTask IS NULL`). Las subtareas no computan independientemente para evitar duplicidades.
*   **Estimación requerida:** La tarea debe tener un tiempo estimado registrado y ser estrictamente mayor a 0 (`estimatedTime > 0`).
*   **Tiempo real registrado:** El usuario debe haber registrado tiempo real en la tarea (`totalLoggedMinutes > 0`). 

> **Nota importante:** Ambos campos (`estimatedTime` y `totalLoggedMinutes`) se procesan internamente estandarizados en **minutos**.

---

## 2. Efectividad Global (Global Effectiveness)

**Objetivo:** Medir si el usuario es capaz de terminar las tareas en un tiempo igual o inferior al que estimó inicialmente. Premia la rapidez y penaliza la lentitud (tardar más de lo previsto).

### Lógica de Cálculo por Tarea

Para cada tarea válida, se calcula la ratio de tiempo consumido:
$$ \text{Ratio} = \frac{\text{Actual}}{\text{Estimado}} $$

1.  **Éxito Total (Rapidez):** 
    Si la ratio es $\leq 1.0$ (el tiempo real es menor o igual al estimado), el usuario obtiene automáticamente el **100%** de efectividad en esa tarea.
2.  **Penalización (Lentitud):**
    Si la ratio es $> 1.0$ (tardó más de lo estimado), se penaliza porcentualmente el exceso restándolo de 100:
    $$ \text{Efectividad} = \max(0, 100 - ((\text{Ratio} - 1) \times 100)) $$

**Ejemplo Práctico:**
*   Estimado: 60 mins. Real: 90 mins.
*   Ratio = 1.5. 
*   Penalización = $(1.5 - 1) \times 100 = 50\%$ de penalización.
*   Efectividad final = 50%.

---

## 3. Precisión de Planificación (Planning Accuracy)

**Objetivo:** Medir la capacidad del usuario para predecir con exactitud cuánto va a tardar. A diferencia de la efectividad, aquí **se penaliza tanto tardar de más como tardar de menos**, ya que ambas situaciones reflejan una mala estimación inicial.

### Lógica de Cálculo por Tarea

La fórmula de precisión evalúa tres escenarios posibles utilizando la variable `actual` y la variable `estimado`:

1.  **Precisión Exacta (Margen del 1%):**
    Si la diferencia entre el tiempo real y el estimado es mínima ($ \leq 0.01 $ en ratio absoluto), se otorga un **100%** de precisión.

2.  **Subestimación (Tardó más de lo previsto / Overrun):**
    Si el tiempo real es mayor al estimado, se calcula el porcentaje de exceso respecto a la estimación y se resta de 100:
    $$ \text{Overrun} = \frac{\text{Actual} - \text{Estimado}}{\text{Estimado}} $$
    $$ \text{Precisión} = \max(0, 100 - (\text{Overrun} \times 100)) $$

3.  **Sobreestimación (Tardó menos de lo previsto / Underrun):**
    El sistema es un poco más indulgente si el usuario termina antes de tiempo, aplicando un **margen de tolerancia del 15%** (`OVERESTIMATE_TOLERANCE = 0.15`).
    $$ \text{Underrun} = \frac{\text{Estimado} - \text{Actual}}{\text{Estimado}} $$
    
    *   Si $ \text{Underrun} \leq 0.15 $, la precisión es del **100%**.
    *   Si el usuario terminó exageradamente rápido (supera el 15% de margen), se le penaliza solo por el exceso de ese margen:
        $$ \text{Exceso} = \text{Underrun} - 0.15 $$
        $$ \text{Precisión} = \max(0, 100 - (\text{Exceso} \times 100)) $$

---

## 4. Cálculo Final del Usuario

Una vez evaluadas individualmente todas las tareas del periodo seleccionado, el porcentaje final que se muestra en el dashboard se obtiene sumando los porcentajes de cada tarea y calculando la media aritmética:

$$ \text{Media Final} = \text{Round}\left(\frac{\sum \text{Porcentajes}}{\text{Total Tareas Válidas}}\right) $$

*(Si el usuario no tiene tareas válidas en el periodo, el sistema devuelve automáticamente **0%**).*