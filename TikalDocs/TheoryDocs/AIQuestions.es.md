### 1. Priorización Híbrida (Urgencia vs. Rentabilidad)

Al introducir el factor monetario cruzado con el tiempo, la IA puede realizar cálculos de coste de oportunidad. Si le pasamos a Groq las tareas con sus estimaciones de tiempo, su ganancia y los deadlines (calculando si la fase o el proyecto caducan pronto), la IA puede actuar como un asesor financiero-temporal.

**Preguntas que el usuario podría hacer:**

* *"Tengo solo 3 horas libres esta tarde. ¿Qué tareas me recomiendas hacer para maximizar mi rentabilidad sin saltarme ningún deadline inminente?"*
* *"De todo lo que tengo pendiente en la fase 'Desarrollo Backend', ¿qué es lo que me está haciendo perder más dinero por hora dedicada?"*
* *"No le puse fecha a mis tareas de 'Marketing', pero el proyecto cierra el viernes. Organízame el día de hoy combinando urgencia y ganancias."*

---

### 2. Arquitecto de Proyectos (Work Breakdown Structure)

Dado que la jerarquía en Tikal es estricta (Proyecto → Fase → Tarea → Subtarea), la IA puede usar su inmenso conocimiento general sobre gestión de proyectos para sugerir estructuras perfectas adaptadas a vuestro modelo, sin necesidad de insertar nada en base de datos.

**Preguntas que el usuario podría hacer:**

* *"Voy a empezar un proyecto para hacer el rebranding de mi empresa. Dime cómo estructurarlo en Tikal. Dame las Fases, y dentro de cada fase, las Tareas principales y Subtareas."*
* *"Tengo una tarea llamada 'Aprender Spring Boot' que veo que se me atasca y tardo mucho. ¿Cómo me sugieres dividirla en subtareas más pequeñas y digeribles?"*
* *"Ayúdame a estimar tiempos. Si quiero hacer una landing page en React, dame una lista de tareas y cuánto tiempo estimado le pondrías a cada una basándote en tu experiencia."*

---

### 3. Auditoría de Hábitos y Diagnóstico de Cuellos de Botella

Con la herramienta de estadísticas (`getAccuracy`, `globalEffectiveness`) y la de horas de mayor rendimiento, el chatbot se convierte en un auditor de productividad que detecta patrones ocultos que el usuario no ve a simple vista.

**Preguntas que el usuario podría hacer:**

* *"Mi porcentaje de planificación no sube del 40%. ¿Me puedes explicar exactamente cómo se calcula en Tikal y qué estoy haciendo mal?"* (Aquí la IA usará el System Prompt para explicarle el margen del 15% y las reglas matemáticas).
* *"Noto que los jueves rindo fatal. Sabiendo mis horas más productivas, ¿cómo me recomiendas distribuir las tareas difíciles que tengo pendientes para mañana?"*
* *"¿Por qué mi efectividad global es del 90% pero mi precisión al planificar es tan baja? Analízalo."* (La IA deducirá que el usuario termina las cosas rápido, pero que estima muy mal al alza, activando la penalización por *Underrun* que se programó).
* *> Respuesta posible del agente a una pregunta: "He analizado tus registros de los últimos 7 días y sueles concentrarte mejor entre las 10:00 y las 12:30"*
* *> Respuesta posible del agente a una pregunta: "Deberías de centrarte más en ciertas actividades en vez de hacer tantos cambios de contexto (la IA ha visto muchos timeLogs de tareas diferentes muy cortos en el tiempo)"*

---

### 4. Estratega de Gamificación (Modo Templo)

En lugar de mirar un panel estático, el usuario interactúa con la filosofía del juego para encontrar la motivación y entender el ecosistema Maya.

**Preguntas que el usuario podría hacer:**

* *"Estoy en el Templo del Jaguar, ¿qué tótems me quedan por desbloquear y cuál crees que es el más fácil de conseguir hoy con las tareas que tengo?"*
* *"He perdido mi racha de efectividad. ¿Cómo funciona exactamente el sistema de rachas para el tótem KIB y cómo lo recupero?"*
* *"Tengo 3 tótems de concentración pero ninguno de planificación. ¿Me propones un reto personal para esta semana centrado en planificar mejor?"*

---

### 5. Prevención de Burnout y Equilibrio (Análisis de Time Logs)

Al tener acceso a las horas exactas de inicio y fin de cada sesión de trabajo, la IA puede detectar si el usuario se está sobrecargando, si no hace pausas o si trabaja a deshoras, actuando como un *Coach* de bienestar.

**Preguntas que el usuario podría hacer:**

* *"He estado trabajando mucho últimamente. Revisa mis registros de los últimos 3 días, ¿estoy haciendo suficientes descansos o trabajo demasiadas horas seguidas?"*
* *"Hoy me siento mentalmente agotado. Sabiendo mis tareas pendientes, ¿qué me recomiendas hacer hoy que sea rentable pero que no me exija estar 4 horas seguidas en Modo Templo?"*
* *"¿A qué hora del día suelo registrar mis sesiones de trabajo más largas? Úsalo para planificar mis tareas críticas de mañana."*

---

### 6. Simulaciones de Conversación (Interacción Multi-Tool)

Estas simulaciones muestran cómo el LLM orquesta diferentes herramientas en una sola llamada para dar una respuesta contextualizada y humana.

**Simulación A: El Síndrome del Multitasking**

> **Usuario:** "Siento que trabajo mucho pero avanzo muy poco. ¿Qué estoy haciendo mal hoy?"
> **Agente:** "He revisado tus registros de hoy. Veo que en las últimas 3 horas has saltado entre 'Diseño de UI', 'API REST' y 'Responder Correos' en ráfagas de apenas 10 minutos. Este exceso de cambios de contexto rompe tu estado de flujo. Te recomiendo agrupar tareas: activa el Modo Templo y dedica los próximos 45 minutos ininterrumpidos exclusivamente a la tarea 'API REST', ya que su deadline es mañana por la mañana."

**Simulación B: Sincronización de Gamificación y Planificación**

> **Usuario:** "Quiero subir de rango y ganar más dinero hoy. ¿Cuál es mi mejor jugada?"
> **Agente:** "Actualmente eres 'Guerrero Águila' y te falta desbloquear el tótem 'Kukulcán de la Precisión' (Objetivo: Precisión > 85%). Tu precisión global actual es del 72% porque sueles subestimar tus tiempos. Para arreglarlo y además maximizar tus ganancias, te sugiero iniciar la tarea 'Integración de Pasarela' (Ganancia: $24,000). Estímala con un 15% extra de margen para evitar la penalización por *Underrun*. ¡Entra en Modo Templo y a por ese tótem!"

**Simulación C: El Rescate del Proyecto**

> **Usuario:** "He procrastinado toda la semana y el proyecto 'Lanzamiento V1' cierra en 48 horas. ¡Ayuda!"
> **Agente:** "Tranquilidad, vamos a trazar un plan táctico. Tienes 5 tareas pendientes en ese proyecto. Las tareas 'Testing' y 'Despliegue' son el cuello de botella. Ignora temporalmente las subtareas estéticas de la fase 'Frontend', ya que no afectan a la ganancia principal y no bloquean el lanzamiento. Concéntrate primero en 'Testing' (estimada en 120 min); tu ratio de efectividad global del 95% me dice que eres capaz de sacarla en menos tiempo si bloqueas distracciones ahora mismo."

