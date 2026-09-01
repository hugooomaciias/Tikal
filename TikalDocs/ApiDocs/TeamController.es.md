# Documentación de Integración Frontend - Módulo de Equipos (Fases 1 y 2)

Esta guía detalla la lógica de negocio detrás de los endpoints del módulo de equipos en el backend. Su objetivo es explicar el comportamiento interno, qué validaciones se hacen en el servidor y cómo el frontend en React debe interactuar con la API, delegando la carga de procesamiento al backend.

---

## Conceptos Generales para el Frontend

* **Autenticación Automática:** No es necesario enviar el ID del usuario actual en el cuerpo de las peticiones. El backend extrae al usuario directamente del token JWT en la cabecera `Authorization`.
* **Gestión de Errores (UI/UX):** El backend lanza excepciones semánticas (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`). El frontend solo debe capturar estos códigos y mostrar notificaciones (toasts) con el mensaje de error que devuelve la API. No es necesario pre-calcular validaciones complejas en el cliente.
* **Imágenes por Defecto:** Al crear un equipo, el backend le asigna automáticamente un avatar generado con *DiceBear* basado en su nombre. El frontend no tiene que preocuparse de generar estas URLs iniciales.

---

## Fase 1: Núcleo y Accesos (El Equipo)

### 1. Crear un Equipo

* **Endpoint:** `POST /api/teams`
* **Payload:** `{ "name": "Backend Team" }`
* **Lógica Interna:** El servidor genera el código alfanumérico único (8 caracteres) y la imagen por defecto. El usuario que hace la petición es añadido automáticamente como `isAdmin = true`.
* **Para el Frontend:** Solo envía el nombre. Recibirás el objeto completo del equipo incluyendo su nuevo código para mostrarlo en pantalla.

### 2. Unirse con Código

* **Endpoint:** `POST /api/teams/join`
* **Payload:** `{ "code": "X7K9P2M" }`
* **Lógica Interna:** Verifica que el código exista y que el usuario no esté ya dentro. Si el usuario ya pertenece al equipo, devuelve un error `400`.
* **Para el Frontend:** Maneja el error 400 amigablemente ("Ya perteneces a este equipo") para que el usuario no piense que el código falló.

### 3. Modificar Datos (Separación de Responsabilidades)

Para evitar sobrescrituras accidentales, la edición de nombre e imagen están en rutas separadas:

* **Cambiar Nombre:** `PUT /api/teams/{teamId}`.
* Envía un JSON puro `{ "name": "Nuevo Nombre" }`.


* **Cambiar/Eliminar Imagen:** `POST /api/teams/{teamId}/image`.
* **Para el Frontend:** Aquí **NO** se envía JSON. Debes construir un objeto `FormData` en React y hacer un `append("file", tuArchivo)`.
* Si el usuario quiere *eliminar* su foto personalizada y volver a los triángulos de colores, envía la petición sin adjuntar archivo (`file` nulo/vacío) y el backend restaurará el patrón de *DiceBear*.



### 4. Regenerar Código de Invitación

* **Endpoint:** `PATCH /api/teams/{teamId}/code/regenerate`
* **Lógica Interna:** Solo para administradores. Reemplaza el código anterior por uno nuevo y lo invalida instantáneamente.
* **Para el Frontend:** Actualiza el estado local de React con el código devuelto para que la UI lo refleje inmediatamente sin necesidad de recargar la página.

### 5. Abandonar Equipo (Validación Crítica)

* **Endpoint:** `DELETE /api/teams/{teamId}/leave`
* **Lógica Interna (Delegada al Backend):**
* Si es usuario normal: Sale sin más.
* Si es el único admin pero hay más gente: El backend bloquea la salida y devuelve un error 400 indicando que debe ceder el liderazgo primero.
* Si es la última persona en el equipo: El backend elimina el equipo entero de la base de datos (borrado en cascada).


* **Para el Frontend:** No calcules cuántos admins quedan en React. Simplemente llama al endpoint. Si devuelve un 400, muestra el *toast* pidiendo que nombre a un sucesor. Si devuelve `204 No Content`, redirige al usuario a la vista principal (Home).

---

## Fase 2: Gestión de Miembros y Roles

### 1. Listar y Buscar Miembros

* **Endpoint:** `GET /api/teams/{teamId}/members?search=termino`
* **Lógica Interna:** Verifica que el solicitante pertenezca al equipo por seguridad.
* **Para el Frontend:** Vincula la barra de búsqueda del componente React directamente a este `Query Param`. Cuando el usuario escriba, haz *debounce* (esperar unos milisegundos) y lanza la petición. El backend te devolverá la lista ya filtrada. No descargues toda la lista para filtrarla con `.filter()` en JavaScript.

### 2. Cambiar Estado de Administrador

* **Endpoint:** `PATCH /api/teams/{teamId}/members/{userId}/admin?isAdmin=true/false`
* **Lógica Interna:** El backend tiene un bloqueo de seguridad: **nadie puede quitarse el admin a sí mismo** a través de este botón. Si un admin quiere dejar de serlo, otro admin debe hacerlo, o bien debe abandonar el equipo.
* **Para el Frontend:** Puedes deshabilitar el botón de *toggle* en la tarjeta del usuario actual si es admin, ya que la API rechazará la petición de autodespido.

### 3. Editar Rol de Trabajo (`teamRole`)

* **Endpoint:** `PATCH /api/teams/{teamId}/members/{userId}/role`
* **Payload:** `{ "teamRole": "Tester" }`
* **Lógica Interna (Permisos Duales):** El backend permite el cambio si el usuario que hace la petición es **Admin** (el jefe organiza) **O** si el usuario que hace la petición es **él mismo** (el integrante actualiza su propia etiqueta).
* **Para el Frontend:** Habilita el *input* de edición del rol en dos escenarios: si el estado global dicta que el visor actual es Admin, o si la tarjeta renderizada coincide con el ID del visor.

### 4. Expulsar Miembro

* **Endpoint:** `DELETE /api/teams/{teamId}/members/{userId}`
* **Lógica Interna:** Solo admins. Protegido contra auto-expulsiones (el backend exige usar `/leave` para salir voluntariamente).
* **Para el Frontend:** Oculta el botón de "Eliminar" en la propia tarjeta del administrador que está viendo la pantalla para evitar confusiones en la interfaz.