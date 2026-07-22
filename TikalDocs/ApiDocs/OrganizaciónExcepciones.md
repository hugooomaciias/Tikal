# Organización del Manejo de Excepciones

Para garantizar una API predecible, limpia y fácil de consumir por parte del cliente, el manejo de errores se ha centralizado siguiendo el estándar **RFC 7807 (Problem Details for HTTP APIs)**.

Se ha eliminado la arquitectura basada en excepciones por entidad (ej. `NotFoundUserException`, `NotFoundProjectException`) para adoptar un enfoque basado puramente en **Códigos de Estado HTTP**. Esto reduce drásticamente la duplicación de código y estandariza las respuestas.

## Estructura de Directorios

```plaintext
📁 exception
 ├── 📁 dto
 │    └── 📄 ErrorResponse.java (Molde estandarizado del JSON de error)
 │
 ├── 📄 BadRequestException.java (HTTP 400 - Errores de validación o reglas de negocio)
 ├── 📄 ConflictException.java (HTTP 409 - Conflictos de estado, ej. email duplicado)
 ├── 📄 ForbiddenAccessException.java (HTTP 403 - Permisos denegados a recursos)
 ├── 📄 GlobalExceptionHandler.java (El @RestControllerAdvice que intercepta todo)
 ├── 📄 ResourceNotFoundException.java (HTTP 404 - Entidades no encontradas en BD)
 └── 📄 UnauthorizedException.java (HTTP 401 - Fallos de autenticación o tokens)
```

## El Controlador Global (`GlobalExceptionHandler`)

En lugar de que cada controlador maneje sus propios errores con bloques `try-catch`, la clase `GlobalExceptionHandler` actúa como un interceptor global (`@RestControllerAdvice`).

Atrapa tanto nuestras excepciones personalizadas (las listadas arriba) como las excepciones nativas de Spring (por ejemplo, `MethodArgumentNotValidException` para errores de validación de los DTOs o `ExpiredJwtException` de la seguridad) y las transforma en un JSON limpio y uniforme.

## Estructura de la Respuesta de Error (`ErrorResponse`)

Independientemente del error que ocurra, el cliente de Frontend siempre recibirá un JSON con esta estructura exacta, facilitando el parseo y la visualización de mensajes de error en la interfaz de Tikal:

```json
{
  "timestamp": "2026-05-15T19:22:33",
  "status": 400,
  "error": "Bad Request",
  "message": "Hay errores en los datos enviados.",
  "path": "/api/time_log",
  "customCode": "OPCIONAL_CODIGO_INTERNO",
  "validationErrors": {
    "name": "no debe estar vacío",
    "initDateTime": "no debe ser nulo"
  }
}
```

*Nota: Campos como `customCode` o `validationErrors` solo se incluyen en el JSON de respuesta si contienen datos, manteniendo el payload ligero.*
