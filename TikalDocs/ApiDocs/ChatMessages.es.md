# Documentación de Integración Frontend - Módulo de Chat en Tiempo Real

Esta guía detalla la arquitectura híbrida del sistema de mensajería de Tikal. Para optimizar el rendimiento, el chat utiliza **REST** para la carga inicial de historiales (pasado) y **WebSockets (STOMP)** para la comunicación bidireccional (presente/futuro).

---

## Conceptos Generales de la Arquitectura

* **Flujo Híbrido:** Cuando el usuario abre la pantalla de chat, React debe hacer peticiones HTTP (`GET`) para cargar la barra lateral y el historial paginado. Una vez pintada la pantalla, React abre la conexión WebSocket y se queda escuchando para inyectar nuevos mensajes en el DOM sin recargar.
* **Lectura Automática:** Los endpoints REST que recuperan el historial de un chat específico marcan automáticamente esos mensajes como leídos en la base de datos (actualizando el contador a 0).
* **DTO Estandarizado:** Tanto la API REST como el WebSocket devuelven el mismo objeto `ChatMessageDTO`. Esto permite a React usar la misma interfaz TypeScript para renderizar mensajes antiguos y nuevos.

---

## Parte 1: API REST (Carga Inicial e Historiales)

### 1. Barra Lateral Mixta (Bandeja de entrada)

* **Endpoint:** `GET /api/chats/sidebar?search=termino`
* **Lógica Interna:** El backend une tus conversaciones directas y los chats de tus equipos, calcula cuántos mensajes sin leer tienes en cada uno, obtiene el último mensaje enviado y ordena toda la lista de más reciente a más antiguo.
* **Para el Frontend:** Si el usuario utiliza el buscador, pasa el texto en el parámetro `search`. No pagines este endpoint en el frontend; el backend devuelve la lista completa optimizada en `ChatSummaryDTO`.

### 2. Historial de Chat Directo (1-a-1)

* **Endpoint:** `GET /api/chats/direct/{otherUserId}?page=0&size=20`
* **Lógica Interna:** Devuelve una página de mensajes ordenada descendentemente (del más nuevo al más antiguo) y marca los mensajes recibidos de `otherUserId` como leídos.
* **Para el Frontend:** Al ser paginado por Spring, la respuesta es un objeto `Page`. Tus mensajes estarán dentro del array `content`. Implementa un *Infinite Scroll* inverso: carga la `page=0`, pinta los mensajes abajo, y si el usuario hace scroll hacia arriba, carga la `page=1`.

### 3. Historial de Chat de Equipo

* **Endpoint:** `GET /api/chats/team/{teamId}?page=0&size=20`
* **Lógica Interna:** Funciona exactamente igual que el chat directo, pero basando la lectura en el `lastReadDate` del miembro dentro de ese equipo.
* **Para el Frontend:** Mismo trato que el chat directo. Usa la propiedad `isTeamMessage` y `teamImage` del DTO para renderizar correctamente la burbuja de chat si es necesario (notificaciones).

---

## Parte 2: WebSockets / STOMP (Tiempo Real)

Para la comunicación en vivo, el frontend (usando librerías como `@stomp/stompjs`) debe establecer una única conexión TCP.

### 1. El Handshake y la Autenticación

* El backend intercepta el token JWT en el momento de la conexión.
* **Para el Frontend:** Al configurar tu cliente STOMP, debes inyectar tu token en las cabeceras de conexión iniciales:

```javascript
connectHeaders: {
  Authorization: `Bearer ${tuTokenJwt}`
}
```

### 2. Suscripciones (Recibir mensajes)

Una vez conectado, React debe suscribirse a los canales que le interesan para escuchar eventos.

* **Para mensajes directos:** Suscríbete a `/user/queue/messages`. (Spring Boot enruta automáticamente a tu ID).
* **Para mensajes de equipo:** Suscríbete a `/topic/team/{teamId}` por cada equipo al que pertenezca el usuario.
* **Acción:** Cuando entre un mensaje por cualquiera de estos canales, el payload será un JSON de `ChatMessageDTO`. Inyéctalo en el array de mensajes actual si tienes ese chat abierto, o incrementa el contador de la barra lateral si estás en otra pantalla.

### 3. Publicación (Enviar mensajes)

El envío de mensajes **NO** se hace por `POST` a la API REST, sino inyectando un comando `SEND` por la tubería STOMP ya abierta.

* **Enviar a un Usuario (Directo):**
* **Destino STOMP:** `/app/chat.direct`
* **Payload:** `{ "receiverId": 5, "content": "Hola, ¿qué tal?" }`


* **Enviar a un Equipo:**
* **Destino STOMP:** `/app/chat.team`
* **Payload:** `{ "teamId": 12, "content": "Adjunto el informe." }`


* **Lógica Interna:** El controlador procesa el mensaje, lo guarda en MySQL para que haya persistencia, lo mapea al `ChatMessageDTO` protegiendo datos sensibles, y hace el *broadcast* a los destinatarios (y a ti mismo) en tiempo real.
