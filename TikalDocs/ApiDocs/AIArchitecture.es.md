## Arquitectura Base y Flujo de Datos

El módulo de inteligencia artificial de Tikal está construido sobre **Spring AI**, utilizando el estándar de conexión de OpenAI redirigido a la API de **Groq**.

* La integración emplea modelos optimizados para llamadas a funciones mediante el identificador exacto en el archivo de propiedades.
* El flujo comienza en controladores que manejan la creación de la sesión, persistiendo mensajes duales (usuario e IA) en MySQL.
* Existe un sistema de degradación elegante que captura excepciones de red y devuelve un mensaje de error formateado para no quebrar la interfaz.

## Gestión de Memoria y Contexto

Para proteger la ventana de tokens y evitar alucinaciones por exceso de información, la memoria del LLM está estrictamente acotada.

* El backend recupera únicamente los últimos 10 mensajes (5 iteraciones) de la base de datos para construir el contexto inmediato.
* La lista resultante se invierte para garantizar la lectura cronológica (del más antiguo al más reciente) por parte del modelo.
* La entrega del historial completo al cliente web se maneja de forma independiente mediante endpoints apoyados en `Pageable`.

## Sistema de Herramientas (Los 4 Agentes Especializados)

El corazón inteligente de Tikal se divide en cuatro dominios funcionales. A través del *Function Calling*, el LLM actúa como un orquestador que consulta a cuatro "agentes" internos (implementados como *Beans* en `AiToolsConfig`) para obtener datos en tiempo real y aportar valor analítico:

* **Agente 1: Auditor de Rendimiento (`getUserStatistics`)**
* **Misión:** Analizar tendencias y diagnosticar fallos de estimación.
* **Capacidades:** Extrae métricas clave como la *Efectividad Global* y la *Precisión de Planificación*, además de la evolución diaria de los últimos 7 días. Se utiliza para explicar al usuario por qué sus métricas bajan o suben, evaluando el margen de tolerancia del 15%.


* **Agente 2: Project Manager (`getPendingTasksOverview`)**
* **Misión:** Optimizar la carga de trabajo cruzando urgencia con rentabilidad.
* **Capacidades:** Recupera el árbol de tareas pendientes con su jerarquía completa. Calcula dinámicamente los días restantes (`daysUntilDeadline`) y estandariza las fechas al formato ISO 8601 (`yyyy-MM-dd`) para que el LLM proponga qué tarea atacar a continuación sin errores de cálculo temporal.


* **Agente 3: Guía de Gamificación (`getGamificationStatus`)**
* **Misión:** Mantener la motivación y alinear la productividad con el "Modo Templo".
* **Capacidades:** Audita el rango actual del usuario y cruza los tótems desbloqueados con los requisitos de los tótems aún bloqueados. Permite a la IA proponer retos a corto plazo para incentivar el desbloqueo de recompensas.


* **Agente 4: Auditor de Patrones de Tiempo (`getRecentTimeLogsOverview`)**
* **Misión:** Prevenir el *burnout*, evaluar el *context switching* y proteger el estado de flujo.
* **Capacidades:** Analiza los registros de tiempo (*Time Logs*) de los últimos 3 días, formateando los *timestamps* a cadenas legibles (`dd-MM-yyyy HH:mm`). Permite a la IA detectar si el usuario salta demasiado entre tareas o identificar a qué horas del día rinde mejor.

## Inyección de Reglas de Negocio

La personalidad y los límites de actuación del asesor se configuran dinámicamente en cada petición, sin persistirse en la base de datos.

* El *System Prompt* se inserta invariablemente en la posición 0 del array de contexto en memoria.
* Define instrucciones estrictas sobre la estructura jerárquica obligatoria (Proyecto > Fase > Tarea > Subtarea) y tolerancias de cálculo como el margen del 15% de error por subestimación.
